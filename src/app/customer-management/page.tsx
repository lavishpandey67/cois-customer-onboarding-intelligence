import AppLayout from '@/components/AppLayout';
import CustomerTableSection from './components/CustomerTableSection';

export default function CustomerManagementPage() {
  return (
    <AppLayout
      title="Customer Management"
      subtitle="50 active onboardings · 9 at risk · Last updated Jul 24, 2026"
    >
      <CustomerTableSection />
    </AppLayout>
  );
}