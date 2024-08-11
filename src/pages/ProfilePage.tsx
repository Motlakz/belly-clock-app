import { useUser } from "@clerk/clerk-react";
import ProfileForm from "../pages/ProfileForm";

export default function ProfilePage() {
    const { user } = useUser();

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen bg-orange-50">
                <p className="text-orange-600 text-xl">Please sign in to view your profile.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center sm:p-12 bg-orange-50 p-4">
            <ProfileForm userId={user.id} />
        </div>
    );
}
