import Header from "../../components/Header/Header";
import { Theme, Container } from "@radix-ui/themes";
import Footer from "../../components/Footer/Footer";
import { Outlet } from "react-router";
import { AuthProvider } from "../../utils/context/AuthContext";

const MainLayout = ({ children }) => {
  return (
    <AuthProvider>
        <Theme>
          <div className="flex flex-col min-h-screen">
            <Header />
            <Container size="4" my="7" mx={{ md: "9", xs: "6", initial: "4" }} className="flex-grow">
              <Outlet />
            </Container>
            <Footer className="mt-auto" />
          </div>
        </Theme>
    </AuthProvider>
  );
};

export default MainLayout;