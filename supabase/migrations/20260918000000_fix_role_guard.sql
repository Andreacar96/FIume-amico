-- Acque Dolci — fix: il guard sul ruolo impediva di creare il primo admin.
--
-- Problema: enforce_profile_role_immutable() annullava in silenzio qualsiasi
-- cambio di public.profiles.role quando is_admin() era false. Nel SQL Editor
-- (e con la chiave service_role) auth.uid() è NULL, quindi is_admin() è false
-- e nessuno poteva promuovere il primo amministratore — avvio circolare.
--
-- Soluzione: il guard si applica solo quando esiste una sessione autenticata.
-- Un utente loggato non admin continua a non potersi auto-promuovere; le
-- operazioni da contesto privilegiato (SQL Editor, service_role) passano.

create or replace function public.enforce_profile_role_immutable()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role <> old.role
     and auth.uid() is not null
     and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end;
$$;

-- Il trigger profiles_role_guard resta invariato: punta alla funzione,
-- che ora ha il comportamento corretto.
