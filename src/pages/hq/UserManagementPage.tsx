import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { UserPlus, Trash2, Shield, Loader2, Users, RefreshCw, Mail, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";
import { ROLE_LABELS, ROLE_COLORS, type AppRole } from "@/hooks/usePermissions";
import { useAuth } from "@/hooks/useAuth";
import { ExecutiveHeader } from "@/components/hq/ExecutiveDataSource";
import { logger } from "@/lib/logger";
import { useTranslation } from "@/contexts/LanguageContext";
import { usersTranslations } from "@/i18n/users";

interface ManagedUser {
  id: string;
  email: string;
  roles: string[];
  created_at: string;
  last_sign_in_at: string | null;
}

const ASSIGNABLE_ROLES: AppRole[] = ["admin", "finance", "marketing", "support", "product", "engineering", "viewer"];

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const t = useTranslation(usersTranslations);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<string>("");

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ["managed-users"],
    queryFn: async (): Promise<ManagedUser[]> => {
      const { data, error } = await supabase.functions.invoke("manage-users", {
        body: { action: "list" },
      });
      if (error) throw error;
      return data?.users || [];
    },
    staleTime: 1000 * 60 * 2,
  });

  const createMutation = useMutation({
    mutationFn: async ({ email, password, role }: { email: string; password: string; role: string }) => {
      const { data, error } = await supabase.functions.invoke("manage-users", {
        body: { action: "create", email, password, role },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      toast.success(t.successCreate);
      setIsCreateOpen(false);
      setNewEmail("");
      setNewPassword("");
      setNewRole("");
      queryClient.invalidateQueries({ queryKey: ["managed-users"] });
    },
    onError: (err: Error) => {
      logger.error("[UserManagement] Create error:", err);
      toast.error(t.error, { description: err.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.functions.invoke("manage-users", {
        body: { action: "delete", user_id: userId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      toast.success(t.successDelete);
      queryClient.invalidateQueries({ queryKey: ["managed-users"] });
    },
    onError: (err: Error) => {
      toast.error(t.error, { description: err.message });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { data, error } = await supabase.functions.invoke("manage-users", {
        body: { action: "update_role", user_id: userId, role },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      toast.success(t.successRoleUpdate);
      queryClient.invalidateQueries({ queryKey: ["managed-users"] });
    },
    onError: (err: Error) => {
      toast.error(t.error, { description: err.message });
    },
  });

  const handleCreate = () => {
    if (!newEmail || !newPassword || !newRole) {
      toast.error(t.fieldsRequired);
      return;
    }
    createMutation.mutate({ email: newEmail, password: newPassword, role: newRole });
  };

  const otherUsers = users.filter(u => u.id !== currentUser?.id);

  return (
    <div className="space-y-6">
      <ExecutiveHeader title={t.title} subtitle={t.subtitle} />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-muted-foreground">{t.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {new Set(users.flatMap(u => u.roles)).size}
                </p>
                <p className="text-sm text-muted-foreground">{t.activeRoles}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Clock className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {users.filter(u => {
                    if (!u.last_sign_in_at) return false;
                    const dayAgo = Date.now() - 86400000;
                    return new Date(u.last_sign_in_at).getTime() > dayAgo;
                  }).length}
                </p>
                <p className="text-sm text-muted-foreground">{t.active24h}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t.userAccounts}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t.refresh}
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                {t.newAccount}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.createTitle}</DialogTitle>
                <DialogDescription>{t.createDesc}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t.emailPlaceholder}
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t.password}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={t.passwordPlaceholder}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">{t.role}</Label>
                  <Select value={newRole} onValueChange={setNewRole}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.selectRole} />
                    </SelectTrigger>
                    <SelectContent>
                      {ASSIGNABLE_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>{t.cancel}</Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {t.createAccount}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : otherUsers.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <Users className="h-10 w-10 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground">{t.noUsers}</p>
              <p className="text-sm text-muted-foreground/70">{t.noUsersHint}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {otherUsers.map((user) => (
            <Card key={user.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="p-2 rounded-full bg-muted">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{user.email}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>{t.createdOn} {new Date(user.created_at).toLocaleDateString("fr-FR")}</span>
                        {user.last_sign_in_at && (
                          <>
                            <Separator orientation="vertical" className="h-3" />
                            <Clock className="h-3 w-3" />
                            <span>{t.lastLogin} {new Date(user.last_sign_in_at).toLocaleDateString("fr-FR")}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      {user.roles.map((role) => (
                        <Badge
                          key={role}
                          className={ROLE_COLORS[role as AppRole] || "bg-muted text-muted-foreground"}
                        >
                          {ROLE_LABELS[role as AppRole] || role}
                        </Badge>
                      ))}
                    </div>

                    <Select
                      value={user.roles[0] || ""}
                      onValueChange={(role) => updateRoleMutation.mutate({ userId: user.id, role })}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder={t.changeRole} />
                      </SelectTrigger>
                      <SelectContent>
                        {ASSIGNABLE_ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {ROLE_LABELS[role]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t.deleteTitle}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t.deleteAccount} <strong>{user.email}</strong> {t.deleteDesc}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(user.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deleteMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              t.delete
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
