import DashboardOverview from './seller/DashboardOverview';
import { useSellerOrderAlert } from "@/hooks/useSellerOrderAlert";

const SellerDashboard: React.FC = () => {
  useSellerOrderAlert();
  return <DashboardOverview />;
};

export default SellerDashboard;