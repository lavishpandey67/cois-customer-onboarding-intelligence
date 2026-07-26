-- COIS Core Tables Migration
-- customers, tasks, milestones (milestone_stages)

-- ============================================================
-- 1. ENUM TYPES
-- ============================================================
DROP TYPE IF EXISTS public.health_band CASCADE;
CREATE TYPE public.health_band AS ENUM ('excellent', 'good', 'fair', 'poor');

DROP TYPE IF EXISTS public.onboarding_stage CASCADE;
CREATE TYPE public.onboarding_stage AS ENUM (
  'Contract Signed', 'Kickoff Meeting', 'Account Setup', 'Configuration',
  'Training', 'First Login', 'First Value', 'Go Live', 'Success Handoff'
);

DROP TYPE IF EXISTS public.customer_tier CASCADE;
CREATE TYPE public.customer_tier AS ENUM ('SMB', 'Mid-Market', 'Enterprise');

DROP TYPE IF EXISTS public.region CASCADE;
CREATE TYPE public.region AS ENUM ('North America', 'Europe', 'Asia Pacific');

DROP TYPE IF EXISTS public.risk_level CASCADE;
CREATE TYPE public.risk_level AS ENUM ('Low', 'Medium', 'High', 'Critical');

DROP TYPE IF EXISTS public.task_priority CASCADE;
CREATE TYPE public.task_priority AS ENUM ('Critical', 'High', 'Medium', 'Low');

DROP TYPE IF EXISTS public.task_status CASCADE;
CREATE TYPE public.task_status AS ENUM ('Backlog', 'In Progress', 'Blocked', 'In Review', 'Completed');

DROP TYPE IF EXISTS public.milestone_status CASCADE;
CREATE TYPE public.milestone_status AS ENUM ('on-track', 'at-risk', 'delayed');

DROP TYPE IF EXISTS public.risk_severity CASCADE;
CREATE TYPE public.risk_severity AS ENUM ('Critical', 'High', 'Medium');

-- ============================================================
-- 2. TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  company TEXT NOT NULL,
  industry TEXT NOT NULL,
  tier public.customer_tier NOT NULL,
  region public.region NOT NULL,
  health_score INTEGER NOT NULL DEFAULT 0,
  health_band public.health_band NOT NULL DEFAULT 'fair',
  stage public.onboarding_stage NOT NULL DEFAULT 'Contract Signed',
  progress INTEGER NOT NULL DEFAULT 0,
  manager TEXT NOT NULL,
  manager_initials TEXT NOT NULL,
  days_in_stage INTEGER NOT NULL DEFAULT 0,
  risk_level public.risk_level NOT NULL DEFAULT 'Low',
  risk_score INTEGER NOT NULL DEFAULT 0,
  contract_value INTEGER NOT NULL DEFAULT 0,
  employees TEXT NOT NULL DEFAULT '',
  last_activity DATE,
  account_owner TEXT NOT NULL,
  start_date DATE,
  expected_go_live DATE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  customer_id TEXT REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  owner TEXT NOT NULL,
  owner_initials TEXT NOT NULL,
  priority public.task_priority NOT NULL DEFAULT 'Medium',
  due_date DATE,
  status public.task_status NOT NULL DEFAULT 'Backlog',
  progress INTEGER NOT NULL DEFAULT 0,
  milestone TEXT NOT NULL DEFAULT '',
  has_blocker BOOLEAN NOT NULL DEFAULT false,
  is_escalated BOOLEAN NOT NULL DEFAULT false,
  depends_on TEXT REFERENCES public.tasks(id) ON DELETE SET NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at DATE,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.milestone_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  total_customers INTEGER NOT NULL DEFAULT 0,
  completed INTEGER NOT NULL DEFAULT 0,
  completion_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  avg_days NUMERIC(5,2) NOT NULL DEFAULT 0,
  target_days INTEGER NOT NULL DEFAULT 0,
  current_customers TEXT[] NOT NULL DEFAULT '{}',
  status public.milestone_status NOT NULL DEFAULT 'on-track',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.risk_alerts (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES public.customers(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  tier public.customer_tier NOT NULL,
  issue TEXT NOT NULL,
  severity public.risk_severity NOT NULL DEFAULT 'Medium',
  days_since_last_activity INTEGER NOT NULL DEFAULT 0,
  manager TEXT NOT NULL,
  revenue_at_risk INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_customers_health_band ON public.customers(health_band);
CREATE INDEX IF NOT EXISTS idx_customers_stage ON public.customers(stage);
CREATE INDEX IF NOT EXISTS idx_customers_tier ON public.customers(tier);
CREATE INDEX IF NOT EXISTS idx_customers_risk_level ON public.customers(risk_level);
CREATE INDEX IF NOT EXISTS idx_tasks_customer_id ON public.tasks(customer_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_severity ON public.risk_alerts(severity);

-- ============================================================
-- 4. ENABLE RLS
-- ============================================================
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestone_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_alerts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. RLS POLICIES (open read for portfolio demo)
-- ============================================================
DROP POLICY IF EXISTS "public_read_customers" ON public.customers;
CREATE POLICY "public_read_customers" ON public.customers FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "public_write_customers" ON public.customers;
CREATE POLICY "public_write_customers" ON public.customers FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_tasks" ON public.tasks;
CREATE POLICY "public_read_tasks" ON public.tasks FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "public_write_tasks" ON public.tasks;
CREATE POLICY "public_write_tasks" ON public.tasks FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_milestone_stages" ON public.milestone_stages;
CREATE POLICY "public_read_milestone_stages" ON public.milestone_stages FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "public_write_milestone_stages" ON public.milestone_stages;
CREATE POLICY "public_write_milestone_stages" ON public.milestone_stages FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_risk_alerts" ON public.risk_alerts;
CREATE POLICY "public_read_risk_alerts" ON public.risk_alerts FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "public_write_risk_alerts" ON public.risk_alerts;
CREATE POLICY "public_write_risk_alerts" ON public.risk_alerts FOR ALL TO public USING (true) WITH CHECK (true);

-- ============================================================
-- 6. SEED DATA
-- ============================================================
DO $$
BEGIN
  -- Customers
  INSERT INTO public.customers (id, company, industry, tier, region, health_score, health_band, stage, progress, manager, manager_initials, days_in_stage, risk_level, risk_score, contract_value, employees, last_activity, account_owner, start_date, expected_go_live)
  VALUES
    ('cust-001','Meridian Financial Group','Financial Services','Enterprise','North America',82,'good','Configuration',45,'Sarah Chen','SC',4,'Low',18,240000,'1,200–2,500','2026-07-23','Sarah Chen','2026-06-10','2026-08-15'),
    ('cust-002','Apex Retail Solutions','Retail & E-Commerce','Mid-Market','North America',54,'fair','Training',62,'Marcus Webb','MW',14,'High',72,96000,'200–500','2026-07-18','Marcus Webb','2026-05-20','2026-07-30'),
    ('cust-003','Solaris Health Systems','Healthcare','Enterprise','North America',91,'excellent','First Value',78,'Priya Nair','PN',2,'Low',12,360000,'5,000+','2026-07-24','Priya Nair','2026-05-01','2026-08-01'),
    ('cust-004','NorthBridge Logistics','Logistics & Supply Chain','Mid-Market','Europe',38,'poor','Account Setup',28,'Lena Müller','LM',21,'Critical',91,84000,'300–800','2026-07-10','Lena Müller','2026-06-01','2026-08-20'),
    ('cust-005','Quantum Dynamics Corp','Manufacturing','Enterprise','North America',76,'good','Go Live',90,'Jordan Ellis','JE',3,'Low',22,480000,'3,000–5,000','2026-07-23','Jordan Ellis','2026-04-15','2026-07-28'),
    ('cust-006','Sakura Digital Agency','Marketing & Advertising','SMB','Asia Pacific',68,'good','First Login',70,'Aiko Tanaka','AT',6,'Medium',41,28800,'50–150','2026-07-22','Aiko Tanaka','2026-06-15','2026-08-05'),
    ('cust-007','Vantage Capital Partners','Financial Services','Enterprise','Europe',44,'poor','Configuration',38,'Daniel Osei','DO',18,'Critical',88,320000,'800–1,500','2026-07-12','Daniel Osei','2026-05-28','2026-08-10'),
    ('cust-008','BlueSky Pharmaceuticals','Pharmaceuticals','Enterprise','North America',85,'excellent','Training',58,'Ryan Castillo','RC',5,'Low',16,288000,'2,000–4,000','2026-07-24','Ryan Castillo','2026-06-20','2026-08-25'),
    ('cust-009','Clearwater Energy','Energy & Utilities','Mid-Market','North America',61,'fair','Kickoff Meeting',12,'Fatima Al-Rashid','FA',8,'Medium',48,72000,'400–900','2026-07-20','Fatima Al-Rashid','2026-07-10','2026-09-15'),
    ('cust-010','Titan Aerospace','Aerospace & Defense','Enterprise','North America',79,'good','Account Setup',22,'Chris Nakamura','CN',7,'Low',28,520000,'10,000+','2026-07-22','Chris Nakamura','2026-07-01','2026-09-30'),
    ('cust-011','GreenLeaf Foods','Food & Beverage','SMB','Europe',72,'good','Configuration',50,'Lena Müller','LM',9,'Medium',35,36000,'100–250','2026-07-21','Lena Müller','2026-06-08','2026-08-10'),
    ('cust-012','Ironclad Cybersecurity','Technology','Mid-Market','North America',88,'excellent','First Value',82,'Sarah Chen','SC',3,'Low',10,144000,'300–600','2026-07-24','Sarah Chen','2026-05-15','2026-07-31'),
    ('cust-013','Nexus Property Group','Real Estate','Mid-Market','Asia Pacific',57,'fair','Training',60,'Aiko Tanaka','AT',11,'High',65,108000,'200–400','2026-07-17','Aiko Tanaka','2026-05-25','2026-08-12'),
    ('cust-014','Cascade Insurance Group','Insurance','Enterprise','North America',93,'excellent','Go Live',92,'Marcus Webb','MW',2,'Low',8,396000,'2,500–5,000','2026-07-24','Marcus Webb','2026-04-01','2026-07-26'),
    ('cust-015','Starfield Media','Media & Entertainment','SMB','Europe',47,'poor','Account Setup',18,'Daniel Osei','DO',16,'High',78,24000,'30–100','2026-07-14','Daniel Osei','2026-06-25','2026-08-30')
  ON CONFLICT (id) DO NOTHING;

  -- Tasks
  INSERT INTO public.tasks (id, title, customer_id, customer_name, owner, owner_initials, priority, due_date, status, progress, milestone, has_blocker, is_escalated, depends_on, description, created_at)
  VALUES
    ('task-001','Complete SSO configuration for Meridian','cust-001','Meridian Financial Group','Sarah Chen','SC','High','2026-07-26','In Progress',65,'Configuration',false,false,null,'Configure SSO with Okta integration per security requirements.','2026-07-20'),
    ('task-002','Schedule training sessions — Apex Retail','cust-002','Apex Retail Solutions','Marcus Webb','MW','Critical','2026-07-25','Blocked',10,'Training',true,true,'task-008','Blocked pending customer availability confirmation.','2026-07-15'),
    ('task-003','API integration review — Solaris Health','cust-003','Solaris Health Systems','Priya Nair','PN','Medium','2026-07-28','In Review',90,'First Value',false,false,null,'Final review of HL7 FHIR API integration before sign-off.','2026-07-18'),
    ('task-004','NorthBridge — escalate setup delay','cust-004','NorthBridge Logistics','Lena Müller','LM','Critical','2026-07-24','Blocked',5,'Account Setup',true,true,null,'Customer IT team unresponsive for 21 days. Executive escalation required.','2026-07-03'),
    ('task-005','Quantum Dynamics — Go Live checklist','cust-005','Quantum Dynamics Corp','Jordan Ellis','JE','High','2026-07-27','In Progress',80,'Go Live',false,false,null,'Complete final pre-launch checklist items.','2026-07-21'),
    ('task-006','Sakura Digital — admin user setup','cust-006','Sakura Digital Agency','Aiko Tanaka','AT','Medium','2026-07-29','In Progress',45,'First Login',false,false,null,'Set up admin accounts for 3 power users.','2026-07-22'),
    ('task-007','Vantage Capital — security review','cust-007','Vantage Capital Partners','Daniel Osei','DO','Critical','2026-07-25','Blocked',20,'Configuration',true,true,null,'Pending compliance team approval for data residency requirements.','2026-07-08'),
    ('task-008','Apex — send training schedule template','cust-002','Apex Retail Solutions','Marcus Webb','MW','High','2026-07-24','Backlog',0,'Training',false,false,null,'Draft and send training schedule template for customer review.','2026-07-20'),
    ('task-009','BlueSky Pharma — compliance documentation','cust-008','BlueSky Pharmaceuticals','Ryan Castillo','RC','High','2026-07-30','In Progress',55,'Training',false,false,null,'Prepare FDA 21 CFR Part 11 compliance documentation.','2026-07-19'),
    ('task-010','Clearwater — kickoff meeting preparation','cust-009','Clearwater Energy','Fatima Al-Rashid','FA','Medium','2026-07-26','In Progress',70,'Kickoff Meeting',false,false,null,'Prepare kickoff deck and stakeholder alignment materials.','2026-07-18'),
    ('task-011','Titan Aerospace — NDA and DPA review','cust-010','Titan Aerospace','Chris Nakamura','CN','High','2026-07-28','In Review',85,'Account Setup',false,false,null,'Legal review of amended NDA and Data Processing Agreement.','2026-07-17'),
    ('task-012','Ironclad — success metrics baseline','cust-012','Ironclad Cybersecurity','Sarah Chen','SC','Medium','2026-07-31','In Progress',40,'First Value',false,false,null,'Establish baseline threat detection metrics pre-launch.','2026-07-21'),
    ('task-013','Nexus Property — retrain on data import','cust-013','Nexus Property Group','Aiko Tanaka','AT','High','2026-07-27','Backlog',0,'Training',false,false,null,'Customer requested additional session on bulk property data import.','2026-07-22'),
    ('task-014','Cascade Insurance — success handoff prep','cust-014','Cascade Insurance Group','Marcus Webb','MW','Medium','2026-07-28','In Progress',60,'Go Live',false,false,null,'Prepare handoff documentation for long-term CS team.','2026-07-20'),
    ('task-015','Starfield Media — IT contact escalation','cust-015','Starfield Media','Daniel Osei','DO','Critical','2026-07-24','Blocked',0,'Account Setup',true,true,null,'No IT contact provided. Cannot proceed with account provisioning.','2026-07-14'),
    ('task-016','GreenLeaf — workflow automation config','cust-011','GreenLeaf Foods','Lena Müller','LM','Low','2026-08-02','Backlog',0,'Configuration',false,false,'task-017','Configure automated approval workflows for purchase orders.','2026-07-22'),
    ('task-017','GreenLeaf — data migration validation','cust-011','GreenLeaf Foods','Lena Müller','LM','Medium','2026-07-30','In Progress',35,'Configuration',false,false,null,'Validate migrated ERP data integrity before workflow config.','2026-07-18'),
    ('task-018','Quantum Dynamics — user acceptance testing','cust-005','Quantum Dynamics Corp','Jordan Ellis','JE','High','2026-07-26','Completed',100,'Go Live',false,false,null,'UAT sign-off from 6 department heads.','2026-07-10'),
    ('task-019','Cascade Insurance — final data validation','cust-014','Cascade Insurance Group','Marcus Webb','MW','High','2026-07-25','Completed',100,'Go Live',false,false,null,'Final validation of policy data migration.','2026-07-15'),
    ('task-020','Ironclad — threat model documentation','cust-012','Ironclad Cybersecurity','Sarah Chen','SC','Low','2026-08-05','Backlog',0,'First Value',false,false,'task-012','Document threat model based on baseline metrics.','2026-07-23')
  ON CONFLICT (id) DO NOTHING;

  -- Milestone Stages
  INSERT INTO public.milestone_stages (name, total_customers, completed, completion_rate, avg_days, target_days, current_customers, status, sort_order)
  VALUES
    ('Contract Signed',50,50,100,0,0,'{}','on-track',1),
    ('Kickoff Meeting',50,47,94,3.2,3,ARRAY['Pinnacle Consulting','Ironclad Mfg','Redwood Analytics'],'on-track',2),
    ('Account Setup',47,43,91,5.8,5,ARRAY['Starfield Media','BlueSky Pharma','Nexus Property','Orion Logistics'],'at-risk',3),
    ('Configuration',43,34,79,11.4,10,ARRAY['NorthBridge Logistics','Vantage Capital','Meridian Financial','Apex Retail','Quantum Dynamics','Cascade Insurance','Solaris Health','BlueSky Pharma','Nexus Property'],'at-risk',4),
    ('Training',34,23,68,9.1,7,ARRAY['Apex Retail Solutions','Nexus Property Group','Ironclad Manufacturing','Pinnacle Consulting','Redwood Analytics','Orion Logistics','Cascade Insurance','Solaris Health','Quantum Dynamics','BlueSky Pharma','Starfield Media'],'delayed',5),
    ('First Login',23,16,70,2.3,2,ARRAY['Solaris Health Systems','Quantum Dynamics','Meridian Financial','Cascade Insurance','NorthBridge Logistics','Vantage Capital','Apex Retail'],'on-track',6),
    ('First Value',16,11,69,14.7,14,ARRAY['Cascade Insurance','Meridian Financial','Solaris Health','Quantum Dynamics','NorthBridge Logistics'],'on-track',7),
    ('Go Live',11,8,73,6.2,7,ARRAY['Cascade Insurance Group','Meridian Financial','Vantage Capital'],'on-track',8),
    ('Success Handoff',8,6,75,4.1,5,ARRAY['Cascade Insurance Group','Meridian Financial Group'],'on-track',9)
  ON CONFLICT (name) DO NOTHING;

  -- Risk Alerts
  INSERT INTO public.risk_alerts (id, customer_id, company, tier, issue, severity, days_since_last_activity, manager, revenue_at_risk)
  VALUES
    ('alert-001','cust-004','NorthBridge Logistics','Mid-Market','IT team unresponsive for 21 days — Account Setup stalled','Critical',14,'Lena Müller',84000),
    ('alert-002','cust-007','Vantage Capital Partners','Enterprise','Compliance approval pending 18 days — Go Live at risk','Critical',12,'Daniel Osei',320000),
    ('alert-003','cust-002','Apex Retail Solutions','Mid-Market','Training blocked — customer availability not confirmed','High',6,'Marcus Webb',96000),
    ('alert-004','cust-015','Starfield Media','SMB','No IT contact provided — account provisioning blocked','High',10,'Daniel Osei',24000),
    ('alert-005','cust-013','Nexus Property Group','Mid-Market','Training stalled — 11 days in stage, no progress update','Medium',7,'Aiko Tanaka',108000)
  ON CONFLICT (id) DO NOTHING;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Seed data error: %', SQLERRM;
END $$;
