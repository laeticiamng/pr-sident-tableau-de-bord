-- Migration 1: Ajouter les nouveaux rôles à l'enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'finance';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'marketing';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'support';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'product';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'engineering';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'viewer';