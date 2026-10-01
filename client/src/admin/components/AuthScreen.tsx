type AuthScreenProps = {
  children: React.ReactNode;
};

export function AuthScreen({ children }: AuthScreenProps) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#F1F5F9] p-6">
      {children}
    </main>
  );
}
