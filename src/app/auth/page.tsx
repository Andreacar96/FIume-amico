import { Card, Field, Input, Button } from "@/components/ui";
import { signInWithPassword, signUpWithPassword, signInWithGoogle } from "./actions";

export default async function AuthPage({
  searchParams,
}: PageProps<"/auth">) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;
  const message = typeof params.message === "string" ? params.message : undefined;

  return (
    <div className="wrap max-w-md mx-auto px-6 py-16">
      <Card className="p-8">
        <h1 className="text-2xl mb-1">Accedi ad Acque Dolci</h1>
        <p className="text-text-muted text-sm mb-6">
          Segnala spot, registra catture e partecipa alla community.
        </p>

        {error && (
          <p className="text-sm mb-4 text-accent border border-accent/40 rounded-md px-3 py-2">
            {error}
          </p>
        )}
        {message && (
          <p className="text-sm mb-4 text-moss border border-moss/40 rounded-md px-3 py-2">
            {message}
          </p>
        )}

        <form action={signInWithGoogle} className="mb-5">
          <Button type="submit" variant="ghost" className="w-full justify-center">
            Continua con Google
          </Button>
        </form>

        <div className="flex items-center gap-3 text-xs text-text-muted mb-5">
          <div className="h-px bg-border flex-1" />
          oppure con email
          <div className="h-px bg-border flex-1" />
        </div>

        <form action={signInWithPassword} className="mb-3">
          <Field label="Email">
            <Input type="email" name="email" required placeholder="tuo@indirizzo.it" />
          </Field>
          <Field label="Password">
            <Input type="password" name="password" required minLength={6} />
          </Field>
          <div className="flex gap-2">
            <Button type="submit" variant="primary" className="flex-1 justify-center">
              Accedi
            </Button>
            <Button
              type="submit"
              formAction={signUpWithPassword}
              variant="ghost"
              className="flex-1 justify-center"
            >
              Registrati
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
