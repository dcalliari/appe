import { useState } from "react";
import { ChatPortaria } from "@/components/ChatPortaria";
import { DocumentsArea } from "@/components/DocumentsArea";
import { LoginScreen } from "@/components/LoginScreen";
import { Navigation } from "@/components/Navigation";
import { NoticeBoard } from "@/components/NoticeBoard";
import { ProfileSettings } from "@/components/ProfileSettings";
import { SpaceBookings } from "@/components/SpaceBookings";
import { VisitorsControl } from "@/components/VisitorsControl";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
	const { user, isLoading } = useAuth();
	const [activeTab, setActiveTab] = useState("home");

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<div className="text-center">
					<div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-muted-foreground">Carregando...</p>
				</div>
			</div>
		);
	}

	if (!user) {
		return <LoginScreen />;
	}

	const renderContent = () => {
		switch (activeTab) {
			case "home":
				return <NoticeBoard />;
			case "chat":
				return <ChatPortaria />;
			case "visitors":
				return <VisitorsControl />;
			case "bookings":
				return <SpaceBookings />;
			case "documents":
				return <DocumentsArea />;
			case "profile":
				return <ProfileSettings />;
			default:
				return <NoticeBoard />;
		}
	};

	return (
		<div className="min-h-screen bg-background">
			<Navigation activeTab={activeTab} onTabChange={setActiveTab} />

			<main className="px-4 py-4 pb-20">{renderContent()}</main>
		</div>
	);
};

export default Index;
