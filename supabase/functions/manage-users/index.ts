import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify caller is owner using their JWT
    const callerClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: caller }, error: authError } = await callerClient.auth.getUser();
    if (authError || !caller) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check owner role via RPC
    const { data: isOwner } = await callerClient.rpc("is_owner");
    if (!isOwner) {
      return new Response(JSON.stringify({ error: "Accès réservé au propriétaire" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;

    // Admin client for user management
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    switch (action) {
      case "create": {
        const { email, password, role } = body;
        if (!email || !password || !role) {
          return new Response(JSON.stringify({ error: "Email, mot de passe et rôle requis" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const validRoles = ["admin", "finance", "marketing", "support", "product", "engineering", "viewer"];
        if (!validRoles.includes(role)) {
          return new Response(JSON.stringify({ error: `Rôle invalide. Rôles disponibles : ${validRoles.join(", ")}` }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        if (password.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
          return new Response(JSON.stringify({ error: "Mot de passe trop faible (min 8 car., 1 maj., 1 min., 1 chiffre)" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Create user via admin API
        const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });

        if (createError) {
          console.error("[manage-users] Create error:", createError.message);
          return new Response(JSON.stringify({ error: createError.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Assign role
        const { error: roleError } = await adminClient
          .from("user_roles")
          .insert({ user_id: newUser.user.id, role });

        if (roleError) {
          console.error("[manage-users] Role assign error:", roleError.message);
          // Cleanup: delete the user if role assignment fails
          await adminClient.auth.admin.deleteUser(newUser.user.id);
          return new Response(JSON.stringify({ error: "Erreur lors de l'assignation du rôle" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({
          success: true,
          user: { id: newUser.user.id, email: newUser.user.email, role },
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "list": {
        // List all users with their roles
        const { data: roles, error: rolesError } = await adminClient
          .from("user_roles")
          .select("user_id, role, created_at");

        if (rolesError) {
          return new Response(JSON.stringify({ error: "Erreur de récupération" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get user details for each role entry
        const userIds = [...new Set((roles || []).map(r => r.user_id))];
        const users = [];

        for (const userId of userIds) {
          const { data: { user }, error } = await adminClient.auth.admin.getUserById(userId);
          if (!error && user) {
            const userRoles = (roles || []).filter(r => r.user_id === userId).map(r => r.role);
            users.push({
              id: user.id,
              email: user.email,
              roles: userRoles,
              created_at: user.created_at,
              last_sign_in_at: user.last_sign_in_at,
            });
          }
        }

        return new Response(JSON.stringify({ users }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "delete": {
        const { user_id } = body;
        if (!user_id) {
          return new Response(JSON.stringify({ error: "user_id requis" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Prevent deleting self
        if (user_id === caller.id) {
          return new Response(JSON.stringify({ error: "Impossible de supprimer votre propre compte" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Delete roles first (cascade should handle it, but be explicit)
        await adminClient.from("user_roles").delete().eq("user_id", user_id);

        const { error: deleteError } = await adminClient.auth.admin.deleteUser(user_id);
        if (deleteError) {
          return new Response(JSON.stringify({ error: deleteError.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "update_role": {
        const { user_id, role } = body;
        if (!user_id || !role) {
          return new Response(JSON.stringify({ error: "user_id et role requis" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        if (user_id === caller.id) {
          return new Response(JSON.stringify({ error: "Impossible de modifier votre propre rôle" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const validRoles = ["admin", "finance", "marketing", "support", "product", "engineering", "viewer"];
        if (!validRoles.includes(role)) {
          return new Response(JSON.stringify({ error: "Rôle invalide" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Remove existing roles and assign new one
        await adminClient.from("user_roles").delete().eq("user_id", user_id);
        const { error: roleError } = await adminClient
          .from("user_roles")
          .insert({ user_id, role });

        if (roleError) {
          return new Response(JSON.stringify({ error: "Erreur lors de la mise à jour du rôle" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Action inconnue" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (err) {
    console.error("[manage-users] Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Erreur interne du serveur" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
