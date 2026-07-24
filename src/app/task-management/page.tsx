import AppLayout from '@/components/AppLayout';
import TaskManagementSection from './components/TaskManagementSection';

export default function TaskManagementPage() {
  return (
    <AppLayout
      title="Task Management"
      subtitle="20 tasks · 4 blocked · 5 escalated · Jul 24, 2026"
    >
      <TaskManagementSection />
    </AppLayout>
  );
}