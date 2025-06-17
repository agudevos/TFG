import Header from "../../components/Header/Header";
import { Theme, Container } from "@radix-ui/themes";
import Footer from "../../components/Footer/Footer";
import { Outlet } from "react-router";
import { AuthProvider } from "../../utils/context/AuthContext";
import backgroundImg from '../../assets/uchoose_background_Image-1.png';
import { EstablishmentProvider } from "../../utils/context/EstablishmentContext";

const MainLayout = () => {
  return (
    <AuthProvider>
      <EstablishmentProvider>
          <Theme>
            <div className="flex flex-col min-h-screen ">
              <Header />
              <Container size="4" my="7" mx={{ md: "9", xs: "6", initial: "4" }} className="flex-grow ">
                <div className="flex flex-col min-h-screen"
                    style={{ 
                      backgroundImage: `url(${backgroundImg})`, 
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat"
                    }}>
                  
                  <Outlet />
                </div>
              </Container>
              <Footer className="mt-auto" />
            </div>
          </Theme>
      </EstablishmentProvider>
    </AuthProvider>
  );
};

export default MainLayout;