import { getCurrentUser } from "@/lib/auth";
import { CinematicHome } from "@/components/marketing/cinematic-home";

export default async function ClassicHomePage() {
  const user = await getCurrentUser();

  return (
    <CinematicHome
      user={
        user
          ? {
              name: user.name,
              onboardingCompleted: user.onboardingCompleted,
            }
          : null
      }
    />
  );
}
