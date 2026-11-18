import { CSSProperties, FormEvent, ReactNode, useEffect, useId, useRef, useState } from "react";

type Screen = "sign-in" | "sign-up" | "admin" | "user";
type AdminPage = "overview" | "pulse" | "radar" | "kudos" | "benefits";
type UserPage = "home" | "send-kudos" | "recovery-benefits" | "profile";

type MoodKey = "tired" | "stressed" | "neutral" | "happy" | "energetic";

type KudosEntry = {
  id: string;
  from: string;
  to: string;
  badge: string;
  department: string;
  message: string;
  points: number;
  celebrations: number;
  time: string;
  color: "teal" | "purple" | "orange" | "blue";
};

type ClaimedVoucher = {
  id: string;
  rewardName: string;
  partner: string;
  pointsCost: number;
  code: string;
  claimedAt: string;
  expiresAt: string;
  status: "Active" | "Used";
};

type MoodCheckInEntry = {
  id: string;
  moodKey: MoodKey;
  moodLabel: string;
  energy: number;
  timestamp: string;
};

type EmployeeProfile = {
  fullName: string;
  username: string;
  department: string;
  password?: string;
};

function useElementWidth<T extends HTMLElement>(fallbackWidth: number) {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(fallbackWidth);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const updateWidth = () => {
      const measured = Number(node.getBoundingClientRect().width.toFixed(2));
      if (measured > 0) {
        setWidth(measured);
      }
    };

    updateWidth();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateWidth);
      return () => window.removeEventListener("resize", updateWidth);
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const next = Number(entry.contentRect.width.toFixed(2));
        if (next > 0) {
          setWidth(next);
        }
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}

function buildSmoothCurvePath(points: { x: number; y: number }[]) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;

    const dx = p2.x - p1.x;
    const m1 =
      i === 0 ? (p2.y - p1.y) / Math.max(1, p2.x - p1.x) : (p2.y - p0.y) / Math.max(1, p2.x - p0.x);
    const m2 =
      i === points.length - 2
        ? (p2.y - p1.y) / Math.max(1, p2.x - p1.x)
        : (p3.y - p1.y) / Math.max(1, p3.x - p1.x);

    const cp1x = p1.x + dx / 3;
    const cp1y = p1.y + (m1 * dx) / 3;
    const cp2x = p2.x - dx / 3;
    const cp2y = p2.y - (m2 * dx) / 3;

    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

function Logo({
  inverse = false,
  variant = "default",
}: {
  inverse?: boolean;
  variant?: "default" | "auth";
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const gradientId = `boostmind-grad-${uid}`;
  const maskId = `boostmind-mask-${uid}`;

  const classNames = [
    "logo",
    inverse ? "logo--inverse" : "",
    variant === "auth" ? "logo--auth" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classNames} aria-label="BoostMind — Wellness & Appreciation">
      <svg className="logo-svg" viewBox="0 0 104 104" fill="none" aria-hidden="true">
        <defs>
          {inverse ? (
            <linearGradient
              id={gradientId}
              gradientUnits="userSpaceOnUse"
              x1="18"
              y1="94"
              x2="92"
              y2="12"
            >
              <stop offset="0%" stopColor="#1FB6AA" />
              <stop offset="55%" stopColor="#5EEAD4" />
              <stop offset="100%" stopColor="#FFFFFF" />
            </linearGradient>
          ) : (
            <linearGradient
              id={gradientId}
              gradientUnits="userSpaceOnUse"
              x1="20"
              y1="94"
              x2="88"
              y2="16"
            >
              <stop offset="0%" stopColor="#0D2137" />
              <stop offset="38%" stopColor="#0D2137" />
              <stop offset="100%" stopColor="#169893" />
            </linearGradient>
          )}
          <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="104" height="104">
            <rect x="0" y="0" width="104" height="104" fill="#ffffff" />
            <path
              d="M 18.25 10.5 L 18.25 84 A 11.78 11.78 0 0 0 41.8 84 L 41.8 33.5 C 41.8 21.5 49.5 13.8 60.5 13.8 C 72.5 13.8 81.2 23.5 81 39"
              stroke="#000000"
              strokeWidth="15.6"
              strokeLinecap="butt"
              strokeLinejoin="round"
            />
          </mask>
        </defs>
        <g
          stroke={`url(#${gradientId})`}
          strokeWidth="6.4"
          strokeLinecap="butt"
          strokeLinejoin="round"
        >
          <path d="M 5.8 27 L 18.25 8.2 L 30.7 27" strokeLinejoin="miter" strokeMiterlimit="10" />
          <path d="M 18.25 10.5 L 18.25 84 A 11.78 11.78 0 0 0 41.8 84 L 41.8 33.5 C 41.8 21.5 49.5 13.8 60.5 13.8 C 72.5 13.8 81.2 23.5 81 39 C 80.8 48.8 75.2 55.5 67.8 55.5 C 63.2 55.5 60.5 52.4 60.5 48.2 C 60.5 41.2 67.8 35.2 80.2 35.4" />
          <path d="M 65.2 54.5 C 73.8 57.8 79.2 63.2 79.2 69.8 C 79.2 76.2 74.4 81.2 67.8 81.8" />
          <path
            mask={`url(#${maskId})`}
            d="M 81 35 C 90.2 35.4 96.2 41.8 96 49 C 95.9 51.4 95.1 53 94.4 54.2 C 97.4 58.4 98.9 64.2 98.9 70.5 C 98.9 86.8 86.2 97.8 69.8 97.8 C 59.8 97.8 50.8 92.8 45.5 84.5"
          />
        </g>
      </svg>
      <span className="logo-wordmark">
        <span className="logo-title">
          <strong className="logo-boost">Boost</strong>
          <span className="logo-mind">Mind</span>
        </span>
        <span className="logo-tagline">WELLNESS &amp; APPRECIATION</span>
      </span>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  );
}

function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="auth-page">
      <section className="auth-card">{children}</section>
    </main>
  );
}

function SignIn({
  onNavigate,
  onLogin,
}: {
  onNavigate: () => void;
  onLogin: (username: string, password: string) => boolean;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!onLogin(username.trim(), password)) {
      setError("Incorrect username or password. Please try again.");
    }
  };

  return (
    <AuthShell>
      <Logo variant="auth" />
      <div className="auth-heading">
        <h1>Welcome back</h1>
        <p>Sign in to continue to your workspace</p>
      </div>
      <form onSubmit={submit} className="auth-form">
        <label>
          <span>Username</span>
          <input
            autoComplete="username"
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
              setError("");
            }}
            placeholder="Enter your username"
          />
        </label>
        <label>
          <span>Password</span>
          <div className="input-with-action">
            <input
              autoComplete="current-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              placeholder="Enter your password"
            />
            <button
              type="button"
              className="field-action"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <EyeIcon />
            </button>
          </div>
        </label>
        <div className="form-row">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            <span>Remember me</span>
          </label>
          <button type="button" className="text-link muted-link">
            Forgot password?
          </button>
        </div>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="primary-button">
          Sign In
        </button>
      </form>
      <p className="auth-switch">
        Don&apos;t have an account?{" "}
        <button type="button" className="text-link" onClick={onNavigate}>
          Sign Up
        </button>
      </p>
    </AuthShell>
  );
}

function SignUp({
  onNavigate,
  onSignUp,
}: {
  onNavigate: () => void;
  onSignUp: (account: EmployeeProfile) => void;
}) {
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    department: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.fullName.trim() || !form.username.trim() || !form.department || !form.password) {
      setError("Please complete all fields.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    onSignUp({
      fullName: form.fullName.trim(),
      username: form.username.trim(),
      department: form.department,
      password: form.password,
    });
  };

  return (
    <AuthShell>
      <Logo variant="auth" />
      <div className="auth-heading compact">
        <h1>Create your account</h1>
        <p>Join your team on BoostMind</p>
      </div>
      <form onSubmit={submit} className="auth-form signup-form">
        <label>
          <span>Full Name</span>
          <input
            autoComplete="name"
            value={form.fullName}
            onChange={(event) => update("fullName", event.target.value)}
            placeholder="Enter your full name"
          />
        </label>
        <label>
          <span>Username</span>
          <input
            autoComplete="username"
            value={form.username}
            onChange={(event) => update("username", event.target.value)}
            placeholder="Choose a username"
          />
        </label>
        <label>
          <span>Department</span>
          <select
            value={form.department}
            onChange={(event) => update("department", event.target.value)}
          >
            <option value="" disabled>
              Select your department
            </option>
            <option>Engineering</option>
            <option>Product & Design</option>
            <option>People & Culture</option>
            <option>Marketing</option>
            <option>Finance</option>
            <option>Operations</option>
          </select>
        </label>
        <div className="split-fields">
          <label>
            <span>Password</span>
            <input
              autoComplete="new-password"
              type="password"
              value={form.password}
              onChange={(event) => update("password", event.target.value)}
              placeholder="Create a password"
            />
          </label>
          <label>
            <span>Confirm Password</span>
            <input
              autoComplete="new-password"
              type="password"
              value={form.confirmPassword}
              onChange={(event) => update("confirmPassword", event.target.value)}
              placeholder="Repeat password"
            />
          </label>
        </div>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="primary-button">
          Sign Up
        </button>
      </form>
      <p className="auth-switch">
        Already have an account?{" "}
        <button type="button" className="text-link" onClick={onNavigate}>
          Sign In
        </button>
      </p>
    </AuthShell>
  );
}

const Icon = ({ name }: { name: string }) => {
  const paths: Record<string, ReactNode> = {
    overview: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),
    home: (
      <>
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5.5 9.5V20h13V9.5" />
        <path d="M9.5 20v-5.5h5V20" />
      </>
    ),
    pulse: <path d="M3 12h4l2.2-5 4.1 10 2.2-5H21" />,
    radar: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="12" r="4.5" />
        <path d="m12 12 5.8-5.8" />
      </>
    ),
    kudos: (
      <>
        <path d="M8 21h8M12 17v4M7 3h10v5a5 5 0 0 1-10 0V3Z" />
        <path d="M7 5H4v2a4 4 0 0 0 4 4M17 5h3v2a4 4 0 0 1-4 4" />
      </>
    ),
    benefits: (
      <>
        <rect x="3" y="6" width="18" height="15" rx="2" />
        <path d="M12 6v15M3 11h18M8.5 6c-2.7 0-3.5-3 0-3 2 0 3.5 3 3.5 3M15.5 6c2.7 0 3.5-3 0-3-2 0-3.5 3-3.5 3" />
      </>
    ),
    profile: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
      </>
    ),
    logout: (
      <>
        <path d="M10 5H5v14h5M14 8l4 4-4 4M9 12h9" />
      </>
    ),
  };
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
};

type NavItem<T extends string> = {
  icon: string;
  label: string;
  page: T;
};

function AppNavigation<T extends string>({
  ariaLabel,
  items,
  activePage,
  supportTitle,
  supportSubtitle,
  onNavigate,
  onSignOut,
}: {
  ariaLabel: string;
  items: readonly NavItem<T>[];
  activePage: T;
  supportTitle: string;
  supportSubtitle: string;
  onNavigate: (page: T) => void;
  onSignOut: () => void;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDrawerOpen(false);
      }
    };
    const onResize = () => {
      if (window.innerWidth >= 1024) {
        setDrawerOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [drawerOpen]);

  const handleSelect = (page: T) => {
    onNavigate(page);
    setDrawerOpen(false);
  };

  const handleLogout = () => {
    setDrawerOpen(false);
    onSignOut();
  };

  return (
    <>
      <aside className="sidebar">
        <Logo inverse />
        <nav className="sidebar-nav" aria-label={ariaLabel}>
          {items.map((item) => (
            <button
              type="button"
              className={activePage === item.page ? "active" : ""}
              key={item.label}
              onClick={() => handleSelect(item.page)}
            >
              <Icon name={item.icon} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="support-card">
            <span className="support-icon">?</span>
            <div>
              <strong>{supportTitle}</strong>
              <p>{supportSubtitle}</p>
            </div>
          </div>
          <button type="button" className="sign-out" onClick={handleLogout}>
            <Icon name="logout" />
            Sign Out
          </button>
        </div>
      </aside>

      <header className="mobile-topbar">
        <Logo inverse />
        <button
          type="button"
          className="mobile-menu-button"
          aria-label="Open navigation menu"
          aria-expanded={drawerOpen}
          aria-controls="boostmind-mobile-drawer"
          onClick={() => setDrawerOpen(true)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </header>

      <div className={`mobile-drawer-root ${drawerOpen ? "open" : ""}`} aria-hidden={!drawerOpen}>
        <div
          className="mobile-drawer-backdrop"
          role="presentation"
          onClick={() => setDrawerOpen(false)}
        />
        <aside
          id="boostmind-mobile-drawer"
          className="mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
        >
          <div className="mobile-drawer-head">
            <Logo inverse />
            <button
              type="button"
              className="mobile-drawer-close"
              aria-label="Close navigation menu"
              onClick={() => setDrawerOpen(false)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
          <nav className="sidebar-nav mobile-drawer-nav" aria-label={`${ariaLabel} drawer`}>
            {items.map((item) => (
              <button
                type="button"
                className={activePage === item.page ? "active" : ""}
                key={item.label}
                onClick={() => handleSelect(item.page)}
                tabIndex={drawerOpen ? 0 : -1}
              >
                <Icon name={item.icon} />
                {item.label}
              </button>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <div className="support-card">
              <span className="support-icon">?</span>
              <div>
                <strong>{supportTitle}</strong>
                <p>{supportSubtitle}</p>
              </div>
            </div>
            <button
              type="button"
              className="sign-out"
              onClick={handleLogout}
              tabIndex={drawerOpen ? 0 : -1}
            >
              <Icon name="logout" />
              Sign Out
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}

function Sidebar({
  activePage,
  onNavigate,
  onSignOut,
}: {
  activePage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  onSignOut: () => void;
}) {
  const items: readonly NavItem<AdminPage>[] = [
    { icon: "overview", label: "Overview", page: "overview" },
    { icon: "pulse", label: "Team Pulse", page: "pulse" },
    { icon: "radar", label: "Burnout Radar", page: "radar" },
    { icon: "kudos", label: "Kudos Feed", page: "kudos" },
    { icon: "benefits", label: "Benefits", page: "benefits" },
  ];
  return (
    <AppNavigation
      ariaLabel="Main navigation"
      items={items}
      activePage={activePage}
      supportTitle="Need support?"
      supportSubtitle="We're here to help"
      onNavigate={onNavigate}
      onSignOut={onSignOut}
    />
  );
}

function DashboardHeader({ name }: { name: string }) {
  const [query, setQuery] = useState("");
  return (
    <header className="dashboard-header">
      <div>
        <h1>Good morning, {name}!</h1>
        <p>Here&apos;s what&apos;s happening with your team today.</p>
      </div>
      <div className="header-actions">
        <label className="search-box">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4 4" />
          </svg>
          <input
            aria-label="Search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search anything..."
          />
          <kbd>⌘ K</kbd>
        </label>
        <button type="button" className="icon-button" aria-label="Notifications">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7M10 20h4" />
          </svg>
          <span className="notification-dot" />
        </button>
        <div className="avatar" aria-label={`${name} profile`}>
          {name.slice(0, 1).toUpperCase()}
        </div>
      </div>
    </header>
  );
}

function BurnoutGauge() {
  return (
    <article className="dashboard-card gauge-card">
      <div className="card-title-row">
        <div>
          <span className="eyebrow">WELLNESS SCORE</span>
          <h2>Team Burnout Risk Index</h2>
        </div>
        <button type="button" className="more-button" aria-label="More options">
          •••
        </button>
      </div>
      <div className="gauge-wrap">
        <div className="gauge-arc-box">
          <svg viewBox="0 0 260 135" className="gauge" aria-label="24 percent average fatigue">
            <defs>
              <linearGradient id="gaugeFill" x1="0" x2="1">
                <stop offset="0" stopColor="#1FB6AA" />
                <stop offset="1" stopColor="#169893" />
              </linearGradient>
            </defs>
            <path className="gauge-bg" d="M35 122 A95 95 0 0 1 225 122" />
            <path className="gauge-value" d="M35 122 A95 95 0 0 1 225 122" />
            <circle cx="130" cy="122" r="7" fill="#fff" stroke="#169893" strokeWidth="5" />
          </svg>
          <strong className="gauge-safe-label">Safe-range</strong>
        </div>
        <span className="gauge-subtitle">Low to Moderate Risk</span>
      </div>
      <div className="metric-footer">
        <span>Average Fatigue</span>
        <strong>24%</strong>
        <span className="metric-change">↓ 4.2%</span>
        <small>vs last week</small>
      </div>
    </article>
  );
}

function TrendChart() {
  const bars = [62, 76, 52, 88, 67, 38, 31];
  const { ref: plotRef, width: plotWidth } = useElementWidth<HTMLDivElement>(620);
  const plotHeight = 174;
  const moodYs = [121, 85, 106, 72, 95, 64];
  const moodPoints = moodYs.map((y, index) => ({
    x: (index / (moodYs.length - 1)) * plotWidth,
    y,
  }));
  const linePath = buildSmoothCurvePath(moodPoints);
  const areaPath = `${linePath} V ${plotHeight} H 0 Z`;

  return (
    <article className="dashboard-card trend-card">
      <div className="card-title-row">
        <div>
          <span className="eyebrow">WEEKLY INSIGHTS</span>
          <h2>Workload &amp; Mood Trend</h2>
        </div>
        <button type="button" className="week-select">
          This week <span>⌄</span>
        </button>
      </div>
      <div className="chart-legend">
        <span>
          <i className="legend-line" /> Mood Index
        </span>
        <span>
          <i className="legend-block" /> Workload Hours
        </span>
      </div>
      <div className="trend-plot" ref={plotRef}>
        <div className="grid-lines">
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="bars">
          {bars.map((height, index) => (
            <span key={index} style={{ height: `${height}%` }} />
          ))}
        </div>
        <svg viewBox={`0 0 ${plotWidth} ${plotHeight}`} aria-hidden="true">
          <defs>
            <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1FB6AA" stopOpacity=".35" />
              <stop offset="1" stopColor="#1FB6AA" stopOpacity=".02" />
            </linearGradient>
          </defs>
          <path className="area" d={areaPath} />
          <path className="line" d={linePath} vectorEffect="non-scaling-stroke" />
          {moodPoints.slice(1, 5).map((pt) => (
            <circle key={pt.x} cx={pt.x} cy={pt.y} r="4" vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
        <div className="days">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
      </div>
    </article>
  );
}

function WarningCard({ onInspect }: { onInspect: () => void }) {
  return (
    <article className="dashboard-card alert-card">
      <div className="card-title-row">
        <div>
          <span className="eyebrow">SMART INSIGHTS</span>
          <h2>AI Early Warning</h2>
        </div>
        <span className="live-badge">
          <i /> Live
        </span>
      </div>
      <div className="ai-alert">
        <div className="spark-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m12 2 1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2Z" />
            <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
          </svg>
        </div>
        <div>
          <span>Attention needed</span>
          <strong>High workload detected in Engineering</strong>
          <p>3 tasks backlog</p>
        </div>
        <button type="button" aria-label="View warning details" onClick={onInspect}>
          ›
        </button>
      </div>
      <div className="alert-footer">
        <span>Updated 12 minutes ago</span>
        <button type="button" onClick={onInspect}>
          View all insights <b>→</b>
        </button>
      </div>
    </article>
  );
}

function KudosCard({ latest, onViewAll }: { latest: KudosEntry; onViewAll: () => void }) {
  return (
    <article className="dashboard-card kudos-card">
      <div className="card-title-row">
        <div>
          <span className="eyebrow">RECENT RECOGNITION</span>
          <h2>Kudos Feed</h2>
        </div>
        <button type="button" className="view-all" onClick={onViewAll}>
          View all
        </button>
      </div>
      <div className="kudos-content">
        <div className={`person-avatar ${latest.color}`}>{latest.from[0]}</div>
        <div className="kudos-copy">
          <p>
            <strong>{latest.from}</strong> sent a{" "}
            <span className="star-card">★ {latest.badge} card</span> to <strong>{latest.to}</strong>
          </p>
          <blockquote>“{latest.message}”</blockquote>
          <span className="time">{latest.time}</span>
        </div>
        <div className="person-avatar maya">{latest.to[0]}</div>
      </div>
      <div className="kudos-footer">
        <div className="reaction-stack">
          <i>★</i>
          <i>♥</i>
          <i>+</i>
        </div>
        <span>{latest.celebrations} teammates celebrated this</span>
        <span className="points-badge">♥ &nbsp;+{latest.points} pts</span>
      </div>
    </article>
  );
}

function OverviewContent({
  latestKudos,
  onNavigate,
}: {
  latestKudos: KudosEntry;
  onNavigate: (page: AdminPage) => void;
}) {
  return (
    <>
      <section className="overview-strip">
        <div>
          <span className="pulse-dot" />
          <p>
            <strong>Your team is doing well today</strong>
            <span>4 insights need your attention</span>
          </p>
        </div>
        <button type="button" onClick={() => onNavigate("pulse")}>
          View team report <span>→</span>
        </button>
      </section>
      <section className="dashboard-grid">
        <BurnoutGauge />
        <TrendChart />
        <WarningCard onInspect={() => onNavigate("radar")} />
        <KudosCard latest={latestKudos} onViewAll={() => onNavigate("kudos")} />
      </section>
    </>
  );
}

const departmentPulse = [
  {
    name: "Engineering",
    responses: "54 / 56",
    participation: 96,
    mood: 4.4,
    energy: 78,
    trend: "+4.2%",
  },
  { name: "IT", responses: "23 / 25", participation: 92, mood: 4.1, energy: 72, trend: "+1.8%" },
  {
    name: "Product",
    responses: "38 / 40",
    participation: 95,
    mood: 4.3,
    energy: 76,
    trend: "+3.1%",
  },
  {
    name: "Marketing",
    responses: "31 / 35",
    participation: 88,
    mood: 4.0,
    energy: 70,
    trend: "-1.2%",
  },
  {
    name: "Operations",
    responses: "38 / 44",
    participation: 89,
    mood: 4.2,
    energy: 73,
    trend: "+2.0%",
  },
];

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function PageIntro({
  eyebrow,
  title,
  description,
  showPrivacy = true,
}: {
  eyebrow: string;
  title: string;
  description: string;
  showPrivacy?: boolean;
}) {
  return (
    <div className="page-intro">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {showPrivacy && (
        <span className="privacy-pill">
          <LockIcon />
          100% Anonymized
        </span>
      )}
    </div>
  );
}

function TeamPulsePage() {
  const [exported, setExported] = useState(false);
  const kpis = [
    {
      label: "Participation",
      value: "92%",
      note: "184 of 200 employees checked in",
      tone: "teal",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 7 10 17l-5-5" />
        </svg>
      ),
    },
    {
      label: "Avg Mood",
      value: "4.2",
      suffix: "/5.0",
      note: "Up 0.3 from last week",
      tone: "navy",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="8.5" />
          <path d="M8.5 14.5c1 1.4 2.2 2 3.5 2s2.5-.6 3.5-2" />
          <circle cx="9.2" cy="10" r=".8" fill="currentColor" stroke="none" />
          <circle cx="14.8" cy="10" r=".8" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
    {
      label: "Avg Energy",
      value: "74%",
      note: "Healthy team baseline",
      tone: "amber",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M13 2 5 13h6l-1 9 9-12h-6l0-8Z" />
        </svg>
      ),
    },
  ];
  return (
    <section className="admin-page">
      <PageIntro
        eyebrow="TEAM SENTIMENT"
        title="Team Pulse"
        description="An anonymous, real-time view of how your people are feeling."
      />
      <div className="kpi-grid">
        {kpis.map((kpi) => (
          <article className="dashboard-card kpi-card" key={kpi.label}>
            <span className={`kpi-icon ${kpi.tone}`}>{kpi.icon}</span>
            <div>
              <span>{kpi.label}</span>
              <strong>
                {kpi.value}
                {kpi.suffix && <small>{kpi.suffix}</small>}
              </strong>
              <p>{kpi.note}</p>
            </div>
          </article>
        ))}
      </div>
      <article className="dashboard-card data-card">
        <div className="data-card-head">
          <div>
            <span className="eyebrow">DEPARTMENT OVERVIEW</span>
            <h3>Anonymized Department Breakdown</h3>
          </div>
          <div className="table-tools">
            <span className="privacy-pill small">
              <LockIcon />
              100% Anonymized
            </span>
            <button type="button" className="outline-button" onClick={() => setExported(true)}>
              {exported ? "CSV Exported" : "Export report"}
            </button>
          </div>
        </div>
        <div className="table-scroll-wrap">
          <table className="pulse-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Participation</th>
                <th>Avg. Mood</th>
                <th>Avg. Energy</th>
                <th>Weekly Trend</th>
                <th>Privacy</th>
              </tr>
            </thead>
            <tbody>
              {departmentPulse.map((row, index) => (
                <tr key={row.name}>
                  <td>
                    <span className={`department-mark mark-${index}`}>{row.name.slice(0, 1)}</span>
                    <div>
                      <strong>{row.name}</strong>
                      <small className="dept-sub">{row.responses} responses</small>
                    </div>
                  </td>
                  <td>
                    <div className="progress-value">
                      <span>
                        <i style={{ width: `${row.participation}%` }} />
                      </span>
                      {row.participation}%
                    </div>
                  </td>
                  <td>
                    <span className="mood-score">●</span> {row.mood.toFixed(1)} / 5.0
                  </td>
                  <td>{row.energy}%</td>
                  <td className={row.trend.startsWith("+") ? "positive" : "negative"}>
                    {row.trend}
                  </td>
                  <td>
                    <span className="privacy-pill table-badge">
                      <LockIcon />
                      100% Anonymized
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="privacy-note">
          Individual responses are never shown. Metrics appear only when 5 or more team members
          respond.
        </div>
      </article>
    </section>
  );
}

const riskDivisions = [
  {
    name: "Engineering",
    score: 68,
    overtime: "1.34x",
    overtimePercent: 76,
    status: "Elevated",
    color: "orange",
    primaryAction: "Rebalance Sprint Load",
    note: "Sustained sprint velocity & after-hours PR activity (+18%)",
  },
  {
    name: "Operations",
    score: 54,
    overtime: "1.18x",
    overtimePercent: 61,
    status: "Watch",
    color: "yellow",
    primaryAction: "Recommend Rest Day",
    note: "Quarter-end logistics load pushing energy down 6%",
  },
  {
    name: "Product & IT",
    score: 31,
    overtime: "0.94x",
    overtimePercent: 28,
    status: "Low",
    color: "teal",
    primaryAction: "Recommend Rest Day",
    note: "Balanced focus blocks and steady recovery cadence",
  },
];

const predictiveTicks = [100, 75, 50, 25, 0] as const;
const predictiveWeeks = [
  "Week 1 (Current)",
  "Week 2 (+7d)",
  "Week 3 (+14d)",
  "Week 4 (+21d)",
] as const;

const predictiveSeries = [
  {
    key: "engineering",
    lineClass: "engineering-line",
    pointClass: "eng-point",
    values: [68, 73, 78, 84],
  },
  {
    key: "operations",
    lineClass: "operations-line",
    pointClass: "ops-point",
    values: [54, 57, 60, 64],
  },
  {
    key: "product",
    lineClass: "product-line",
    pointClass: "prod-point",
    values: [31, 29, 32, 30],
  },
] as const;

function PredictiveRiskChart() {
  const chartHeight = 240;
  const { ref: plotRef, width: plotWidth } = useElementWidth<HTMLDivElement>(520);
  const horizontalInset = 10;
  const innerWidth = Math.max(1, plotWidth - horizontalInset * 2);

  const valueToY = (score: number) => chartHeight - (score / 100) * chartHeight;
  const indexToX = (index: number) =>
    horizontalInset + (index / (predictiveWeeks.length - 1)) * innerWidth;

  const safeThresholdY = valueToY(50);

  return (
    <div className="prediction-chart-block">
      <div className="prediction-chart-frame">
        <div className="prediction-y-axis" aria-hidden="true">
          {predictiveTicks.map((tick) => (
            <span key={tick} style={{ top: `${100 - tick}%` }}>
              {tick}
            </span>
          ))}
        </div>
        <div className="prediction-plot-canvas" ref={plotRef}>
          <span className="threshold-label">Safe threshold (50)</span>
          <svg
            viewBox={`0 0 ${plotWidth} ${chartHeight}`}
            aria-label="Four week predictive risk chart"
          >
            <rect
              className="safe-area"
              x={0}
              y={safeThresholdY}
              width={plotWidth}
              height={chartHeight - safeThresholdY}
            />
            {predictiveTicks.map((tick) => {
              const y = valueToY(tick);
              return (
                <line
                  key={tick}
                  className={
                    tick === 50 ? "prediction-grid-line threshold" : "prediction-grid-line"
                  }
                  x1={0}
                  y1={y}
                  x2={plotWidth}
                  y2={y}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
            {predictiveSeries.map((series) => {
              const coords = series.values.map((score, idx) => ({
                x: indexToX(idx),
                y: valueToY(score),
              }));
              return (
                <path
                  key={series.key}
                  className={series.lineClass}
                  d={buildSmoothCurvePath(coords)}
                  strokeWidth={2.5}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
            {predictiveSeries.map((series) =>
              series.values.map((score, idx) => (
                <circle
                  key={`${series.key}-${idx}`}
                  className={series.pointClass}
                  cx={indexToX(idx)}
                  cy={valueToY(score)}
                  r={4}
                  strokeWidth={2.5}
                  vectorEffect="non-scaling-stroke"
                />
              )),
            )}
          </svg>
        </div>
      </div>
      <div className="prediction-labels">
        {predictiveWeeks.map((week) => (
          <span key={week}>{week}</span>
        ))}
      </div>
    </div>
  );
}

function BurnoutRadarPage() {
  const [selectedActions, setSelectedActions] = useState<Record<string, string>>({});
  const triggerAction = (division: string, action: string) =>
    setSelectedActions((current) => ({ ...current, [division]: action }));
  return (
    <section className="admin-page">
      <PageIntro
        eyebrow="PREDICTIVE WELLNESS"
        title="Burnout Radar"
        description="Privacy-first risk indicators based on aggregated workload and wellness patterns."
      />
      <div className="risk-layout">
        <div className="risk-list">
          {riskDivisions.map((division) => {
            const chosen = selectedActions[division.name];
            return (
              <article className="dashboard-card risk-card" key={division.name}>
                <div className="risk-card-head">
                  <div>
                    <span className={`risk-dot ${division.color}`} />
                    <strong>{division.name}</strong>
                    <span className={`risk-label ${division.color}`}>{division.status} Risk</span>
                  </div>
                  <span className="privacy-pill table-badge">
                    <LockIcon />
                    Privacy-first
                  </span>
                </div>
                <div className="risk-metrics">
                  <div
                    className={`risk-ring ${division.color}`}
                    style={{ "--score": division.score } as CSSProperties}
                  >
                    <strong>{division.score}</strong>
                    <span>Risk Score</span>
                  </div>
                  <div className="overtime-metric">
                    <span>
                      Overtime Index <strong>{division.overtime}</strong>
                    </span>
                    <div>
                      <i style={{ width: `${division.overtimePercent}%` }} />
                    </div>
                    <small>{division.note}</small>
                  </div>
                </div>
                <div className="risk-action">
                  <span>
                    <b>AI Preventive Actions</b>
                    {chosen ? `Queued: ${chosen}` : `Suggested: ${division.primaryAction}`}
                  </span>
                  <div className="risk-action-buttons">
                    <button
                      type="button"
                      className={
                        chosen === "Recommend Rest Day"
                          ? "action-pill selected"
                          : division.primaryAction === "Recommend Rest Day"
                            ? "action-pill primary"
                            : "action-pill secondary"
                      }
                      onClick={() => triggerAction(division.name, "Recommend Rest Day")}
                    >
                      {chosen === "Recommend Rest Day" ? "✓ Rest Day Sent" : "Recommend Rest Day"}
                    </button>
                    <button
                      type="button"
                      className={
                        chosen === "Rebalance Sprint Load"
                          ? "action-pill selected"
                          : division.primaryAction === "Rebalance Sprint Load"
                            ? "action-pill primary"
                            : "action-pill secondary"
                      }
                      onClick={() => triggerAction(division.name, "Rebalance Sprint Load")}
                    >
                      {chosen === "Rebalance Sprint Load"
                        ? "✓ Sprint Rebalanced"
                        : "Rebalance Sprint Load"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <article className="dashboard-card prediction-card">
          <div className="data-card-head">
            <div>
              <span className="eyebrow">4-WEEK FORECAST</span>
              <h3>4-Week Predictive Risk Chart</h3>
            </div>
            <span className="accuracy-pill">87% confidence</span>
          </div>
          <div className="prediction-legend">
            <span>
              <i className="eng" /> Engineering
            </span>
            <span>
              <i className="ops" /> Operations
            </span>
            <span>
              <i className="prod" /> Product &amp; IT
            </span>
            <span>
              <i className="safe" /> Safe threshold
            </span>
          </div>
          <PredictiveRiskChart />
          <div className="forecast-callout">
            <span className="spark-icon small">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m12 2 1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2Z" />
              </svg>
            </span>
            <p>
              <strong>AI Preventive Forecast</strong>
              Engineering is projected to reach 78/100 in Week 3 without sprint load rebalancing;
              applying AI recommendations lowers 4-week risk by ~22%.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}

const initialKudosItems: KudosEntry[] = [
  {
    id: "k1",
    from: "Aris",
    to: "Maya",
    badge: "Star",
    department: "Engineering",
    message: "Amazing support on the client launch!",
    points: 15,
    celebrations: 12,
    time: "12 min ago",
    color: "teal",
  },
  {
    id: "k2",
    from: "Nina",
    to: "Dimas",
    badge: "Team Player",
    department: "Product",
    message: "Thank you for turning complex feedback into a clear plan.",
    points: 20,
    celebrations: 9,
    time: "28 min ago",
    color: "purple",
  },
  {
    id: "k3",
    from: "Rafi",
    to: "Sarah",
    badge: "Above & Beyond",
    department: "Marketing",
    message: "You made the campaign launch feel effortless.",
    points: 25,
    celebrations: 15,
    time: "46 min ago",
    color: "orange",
  },
  {
    id: "k4",
    from: "Hana",
    to: "Bima",
    badge: "Innovator",
    department: "IT",
    message: "Automated the access provisioning workflow and saved hours for everyone.",
    points: 20,
    celebrations: 11,
    time: "1 hr ago",
    color: "blue",
  },
  {
    id: "k5",
    from: "Tari",
    to: "Raka",
    badge: "Team Player",
    department: "Operations",
    message: "Stepped in smoothly to coordinate vendor onboarding ahead of schedule.",
    points: 15,
    celebrations: 8,
    time: "2 hrs ago",
    color: "teal",
  },
  {
    id: "k6",
    from: "Maya",
    to: "Leo",
    badge: "Star",
    department: "Engineering",
    message: "Great pairing session and thoughtful code review!",
    points: 15,
    celebrations: 7,
    time: "3 hrs ago",
    color: "blue",
  },
];

function KudosFeedPage({ items }: { items: KudosEntry[] }) {
  const [badgeFilter, setBadgeFilter] = useState("All badges");
  const [departmentFilter, setDepartmentFilter] = useState("All departments");
  const [celebrated, setCelebrated] = useState<string[]>([]);
  const badges = [
    "All badges",
    "Team Player",
    "Problem Solver",
    "Initiative",
    "Support",
    "Star",
    "Above & Beyond",
    "Innovator",
  ];
  const filtered = items.filter(
    (item) =>
      (badgeFilter === "All badges" || item.badge === badgeFilter) &&
      (departmentFilter === "All departments" || item.department === departmentFilter),
  );
  const toggleCelebrate = (id: string) =>
    setCelebrated((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );

  return (
    <section className="admin-page">
      <PageIntro
        eyebrow="COMPANY RECOGNITION"
        title="Kudos Feed"
        description="Celebrate the everyday actions that make your company stronger."
        showPrivacy={false}
      />
      <div className="feed-layout">
        <article className="dashboard-card feed-panel">
          <div className="feed-toolbar">
            <div>
              <span className="eyebrow">LIVE APPRECIATION</span>
              <h3>Company-wide Appreciation Feed</h3>
            </div>
            <div className="filter-group">
              <select
                value={badgeFilter}
                onChange={(event) => setBadgeFilter(event.target.value)}
                aria-label="Filter by badge"
              >
                <option>All badges</option>
                <option>Team Player</option>
                <option>Problem Solver</option>
                <option>Initiative</option>
                <option>Support</option>
                <option>Star</option>
                <option>Above &amp; Beyond</option>
                <option>Innovator</option>
              </select>
              <select
                value={departmentFilter}
                onChange={(event) => setDepartmentFilter(event.target.value)}
                aria-label="Filter by department"
              >
                <option>All departments</option>
                <option>Engineering</option>
                <option>IT</option>
                <option>Product</option>
                <option>Marketing</option>
                <option>Operations</option>
              </select>
            </div>
          </div>
          <div className="badge-pills" role="tablist" aria-label="Badge quick filters">
            {badges.map((badge) => (
              <button
                key={badge}
                type="button"
                className={badgeFilter === badge ? "active" : ""}
                onClick={() => setBadgeFilter(badge)}
              >
                {badge}
              </button>
            ))}
          </div>
          <div className="company-feed">
            {filtered.map((item) => {
              const isLiked = celebrated.includes(item.id);
              return (
                <div className="feed-item" key={item.id}>
                  <div className={`person-avatar ${item.color}`}>{item.from[0]}</div>
                  <div className="feed-copy">
                    <p>
                      <strong>{item.from}</strong> sent{" "}
                      <span className={`badge-chip ${item.color}`}>★ {item.badge}</span> to{" "}
                      <strong>{item.to}</strong>
                    </p>
                    <blockquote>“{item.message}”</blockquote>
                    <div className="feed-meta-row">
                      <span>
                        {item.department} · {item.time}
                      </span>
                      <button
                        type="button"
                        className={`celebrate-btn ${isLiked ? "liked" : ""}`}
                        onClick={() => toggleCelebrate(item.id)}
                      >
                        ♥ {item.celebrations + (isLiked ? 1 : 0)} celebrated
                      </button>
                    </div>
                  </div>
                  <span className="points-badge">♥ &nbsp;+{item.points} pts</span>
                </div>
              );
            })}
            {!filtered.length && (
              <div className="empty-state">No appreciation matches these filters.</div>
            )}
          </div>
        </article>
        <aside className="dashboard-card champions-card">
          <div>
            <span className="eyebrow">MONTHLY LEADERBOARD</span>
            <h3>Top Appreciation Champions</h3>
            <p>Most active recognition givers &amp; receivers this month</p>
          </div>
          <div className="podium">
            <div>
              <span className="champion-avatar second">D</span>
              <strong>Dimas</strong>
              <small>18 kudos</small>
              <i>2</i>
            </div>
            <div className="first">
              <span className="crown">♛</span>
              <span className="champion-avatar">A</span>
              <strong>Aris</strong>
              <small>24 kudos</small>
              <i>1</i>
            </div>
            <div>
              <span className="champion-avatar third">N</span>
              <strong>Nina</strong>
              <small>15 kudos</small>
              <i>3</i>
            </div>
          </div>
          <div className="leader-list">
            <div>
              <b>4</b>
              <span className="person-avatar blue">S</span>
              <p>
                <strong>Sarah</strong>
                <small>Marketing</small>
              </p>
              <em>12 kudos</em>
            </div>
            <div>
              <b>5</b>
              <span className="person-avatar purple">M</span>
              <p>
                <strong>Maya</strong>
                <small>Engineering</small>
              </p>
              <em>10 kudos</em>
            </div>
            <div>
              <b>6</b>
              <span className="person-avatar orange">H</span>
              <p>
                <strong>Hana</strong>
                <small>IT</small>
              </p>
              <em>9 kudos</em>
            </div>
          </div>
          <div className="champion-note">Champions earn a monthly +50 appreciation point bonus</div>
        </aside>
      </div>
    </section>
  );
}

type Benefit = {
  name: string;
  partner: string;
  points: number;
  category: string;
  claims: number;
  active: boolean;
  color: string;
};

function BenefitIcon({ category }: { category: string }) {
  if (category === "Time Off") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z" />
      </svg>
    );
  }
  if (category === "Mental Wellness") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.5 9v6M17.5 9v6M4 10.5v3M20 10.5v3M6.5 12h11" />
    </svg>
  );
}

function BenefitsPage() {
  const [benefits, setBenefits] = useState<Benefit[]>([
    {
      name: "Extra Rest Leave",
      partner: "BoostMind HR Time-Off",
      points: 300,
      category: "Time Off",
      claims: 48,
      active: true,
      color: "teal",
    },
    {
      name: "Psychologist Counseling",
      partner: "CalmSpace Clinical Partner",
      points: 500,
      category: "Mental Wellness",
      claims: 26,
      active: true,
      color: "purple",
    },
    {
      name: "Fitness & Gym Voucher",
      partner: "FitPass Corporate Network",
      points: 250,
      category: "Physical Wellness",
      claims: 67,
      active: true,
      color: "orange",
    },
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newBenefit, setNewBenefit] = useState({
    name: "",
    partner: "",
    points: "",
    category: "Physical Wellness",
  });
  const toggle = (name: string) =>
    setBenefits((items) =>
      items.map((item) => (item.name === name ? { ...item, active: !item.active } : item)),
    );
  const addBenefit = (event: FormEvent) => {
    event.preventDefault();
    if (!newBenefit.name.trim() || !newBenefit.points) return;
    setBenefits((current) => [
      ...current,
      {
        name: newBenefit.name.trim(),
        partner: newBenefit.partner.trim() || "Corporate Wellness Partner",
        points: Number(newBenefit.points),
        category: newBenefit.category,
        claims: 0,
        active: true,
        color: "blue",
      },
    ]);
    setNewBenefit({ name: "", partner: "", points: "", category: "Physical Wellness" });
    setModalOpen(false);
  };
  return (
    <section className="admin-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">REWARDS MANAGEMENT</span>
          <h2>Benefits</h2>
          <p>Manage the corporate benefits employees can redeem with appreciation points.</p>
        </div>
        <button type="button" className="add-button" onClick={() => setModalOpen(true)}>
          + Add New Benefit
        </button>
      </div>
      <div className="benefit-kpis">
        <article className="dashboard-card">
          <span>Active Benefits</span>
          <strong>{benefits.filter((item) => item.active).length}</strong>
          <small>of {benefits.length} total</small>
        </article>
        <article className="dashboard-card">
          <span>Points Redeemed</span>
          <strong>38,450</strong>
          <small>+12.4% this month</small>
        </article>
        <article className="dashboard-card">
          <span>Benefits Claimed</span>
          <strong>{benefits.reduce((sum, item) => sum + item.claims, 0)}</strong>
          <small>across all partners</small>
        </article>
        <article className="dashboard-card">
          <span>Employee Reach</span>
          <strong>78%</strong>
          <small>156 active members</small>
        </article>
      </div>
      <div className="catalog-head">
        <div>
          <span className="eyebrow">PARTNER CATALOG</span>
          <h3>Corporate Partner Catalog</h3>
        </div>
        <span className="catalog-count">
          Showing {benefits.length} partner rewards · Toggle availability anytime
        </span>
      </div>
      <div className="benefit-grid">
        {benefits.map((benefit) => (
          <article
            className={`dashboard-card benefit-card ${benefit.active ? "" : "inactive"}`}
            key={benefit.name}
          >
            <div className={`benefit-visual ${benefit.color}`}>
              <span>
                <BenefitIcon category={benefit.category} />
              </span>
              <small>{benefit.category}</small>
              <em className={`benefit-state ${benefit.active ? "on" : "off"}`}>
                {benefit.active ? "Active" : "Paused"}
              </em>
            </div>
            <div className="benefit-body">
              <div className="benefit-title">
                <h3>{benefit.name}</h3>
                <button
                  type="button"
                  role="switch"
                  aria-checked={benefit.active}
                  className={`toggle ${benefit.active ? "on" : ""}`}
                  onClick={() => toggle(benefit.name)}
                  aria-label={`Toggle ${benefit.name}`}
                >
                  <i />
                </button>
              </div>
              <p>{benefit.partner}</p>
              <div className="benefit-meta">
                <strong>
                  {benefit.points} <small>pts</small>
                </strong>
                <span>{benefit.claims} claims</span>
              </div>
            </div>
          </article>
        ))}
      </div>
      {modalOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setModalOpen(false)}>
          <div
            className="benefit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="benefit-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <span className="eyebrow">CATALOG MANAGEMENT</span>
                <h2 id="benefit-modal-title">Add New Benefit</h2>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} aria-label="Close">
                ×
              </button>
            </div>
            <form onSubmit={addBenefit} className="modal-form">
              <label>
                <span>Benefit Name</span>
                <input
                  autoFocus
                  value={newBenefit.name}
                  onChange={(event) =>
                    setNewBenefit((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="e.g. Healthy Meal Voucher"
                />
              </label>
              <label className="modal-Partner-field">
                <span>Corporate Partner</span>
                <input
                  value={newBenefit.partner}
                  onChange={(event) =>
                    setNewBenefit((current) => ({ ...current, partner: event.target.value }))
                  }
                  placeholder="e.g. GreenBowl Corporate Partner"
                />
              </label>
              <div className="modal-fields">
                <label>
                  <span>Points Required</span>
                  <input
                    type="number"
                    min="1"
                    value={newBenefit.points}
                    onChange={(event) =>
                      setNewBenefit((current) => ({ ...current, points: event.target.value }))
                    }
                    placeholder="300"
                  />
                </label>
                <label>
                  <span>Category</span>
                  <select
                    value={newBenefit.category}
                    onChange={(event) =>
                      setNewBenefit((current) => ({ ...current, category: event.target.value }))
                    }
                  >
                    <option>Time Off</option>
                    <option>Mental Wellness</option>
                    <option>Physical Wellness</option>
                  </select>
                </label>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="outline-button"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Add Benefit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

function AdminDashboard({
  kudosFeed,
  onSignOut,
}: {
  kudosFeed: KudosEntry[];
  onSignOut: () => void;
}) {
  const [page, setPage] = useState<AdminPage>("overview");
  return (
    <div className="dashboard-shell">
      <Sidebar activePage={page} onNavigate={setPage} onSignOut={onSignOut} />
      <main className="dashboard-main">
        <DashboardHeader name="Admin" />
        {page === "overview" && <OverviewContent latestKudos={kudosFeed[0]} onNavigate={setPage} />}
        {page === "pulse" && <TeamPulsePage />}
        {page === "radar" && <BurnoutRadarPage />}
        {page === "kudos" && <KudosFeedPage items={kudosFeed} />}
        {page === "benefits" && <BenefitsPage />}
      </main>
    </div>
  );
}

type Teammate = {
  name: string;
  shortName: string;
  department: string;
  role: string;
};

const teammates: Teammate[] = [
  { name: "Fadli A.", shortName: "Fadli A.", department: "IT", role: "Systems Engineer" },
  { name: "Maya R.", shortName: "Maya", department: "Engineering", role: "Frontend Engineer" },
  { name: "Dimas P.", shortName: "Dimas", department: "Product", role: "Product Designer" },
  { name: "Sarah K.", shortName: "Sarah", department: "Marketing", role: "Growth Lead" },
  { name: "Raka S.", shortName: "Raka", department: "Operations", role: "People Ops Specialist" },
];

const moodOptions: {
  key: MoodKey;
  label: string;
  statusLabel: string;
}[] = [
  { key: "tired", label: "Tired", statusLabel: "Low / Tired" },
  { key: "stressed", label: "Stressed", statusLabel: "Tense / Stressed" },
  { key: "neutral", label: "Neutral/Good", statusLabel: "Calm/Good" },
  { key: "happy", label: "Happy", statusLabel: "Upbeat / Happy" },
  { key: "energetic", label: "Energetic", statusLabel: "Peak / Energetic" },
];

function MoodFaceIcon({ mood }: { mood: MoodKey }) {
  if (mood === "tired") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" />
        <path d="M8 10.5h2.5M13.5 10.5H16" />
        <path d="M9 15.5c1-.8 2-.9 3-.9s2 .1 3 .9" />
      </svg>
    );
  }
  if (mood === "stressed") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" />
        <path d="m8 9.2 2.2 1.2M16 9.2l-2.2 1.2" />
        <path d="M8.5 15.6c1-1.1 2.2-1.4 3.5-1.4s2.5.3 3.5 1.4" />
      </svg>
    );
  }
  if (mood === "neutral") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="9.2" cy="10.2" r=".9" fill="currentColor" stroke="none" />
        <circle cx="14.8" cy="10.2" r=".9" fill="currentColor" stroke="none" />
        <path d="M8.8 14.3c.9 1 2 1.5 3.2 1.5s2.3-.5 3.2-1.5" />
      </svg>
    );
  }
  if (mood === "happy") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="9.2" cy="10" r=".9" fill="currentColor" stroke="none" />
        <circle cx="14.8" cy="10" r=".9" fill="currentColor" stroke="none" />
        <path d="M8.2 13.8c1 1.8 2.3 2.6 3.8 2.6s2.8-.8 3.8-2.6" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.2 10.2c.5-.8 1.4-.8 1.9 0M13.9 10.2c.5-.8 1.4-.8 1.9 0" />
      <path d="M8 13.5c.9 2.2 2.3 3.2 4 3.2s3.1-1 4-3.2Z" />
    </svg>
  );
}

const userBadgeOptions = [
  {
    name: "Team Player",
    tagline: "Uplifts collaboration",
    color: "teal" as const,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="9" cy="8.5" r="3" />
        <circle cx="15.5" cy="9.5" r="2.5" />
        <path d="M3.8 18.5a5.2 5.2 0 0 1 10.4 0M13.5 18.5a4.3 4.3 0 0 1 6.7-3.5" />
      </svg>
    ),
  },
  {
    name: "Problem Solver",
    tagline: "Unblocks tough challenges",
    color: "purple" as const,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.4 1.2 2.2h4.8c.1-.8.5-1.6 1.2-2.2A6 6 0 0 0 12 3Z" />
      </svg>
    ),
  },
  {
    name: "Initiative",
    tagline: "Leads proactively",
    color: "orange" as const,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13 2 5 13h6l-1 9 9-12h-6l0-8Z" />
      </svg>
    ),
  },
  {
    name: "Support",
    tagline: "Always has your back",
    color: "blue" as const,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
      </svg>
    ),
  },
];

const pointChoices = [150, 250, 500] as const;

const recoveryRewards = [
  {
    id: "rest-leave",
    name: "Extra Rest Leave (1 Day)",
    partner: "BoostMind HR Time-Off",
    category: "Time Off",
    points: 300,
    color: "teal",
    codePrefix: "BM-REST",
    description: "Take a full paid recovery day off with zero impact on annual PTO balance.",
  },
  {
    id: "counseling",
    name: "Psychologist Counseling",
    partner: "CalmSpace Clinical Partner",
    category: "Mental Wellness",
    points: 500,
    color: "purple",
    codePrefix: "BM-MIND",
    description: "Private 60-minute 1-on-1 session with a licensed clinical psychologist.",
  },
  {
    id: "gym-voucher",
    name: "Fitness & Gym Voucher",
    partner: "FitPass Corporate Network",
    category: "Physical Wellness",
    points: 250,
    color: "orange",
    codePrefix: "BM-FIT",
    description: "30-day all-access pass across partner studios, gyms, and recovery spas.",
  },
] as const;

function UserSidebar({
  activePage,
  onNavigate,
  onSignOut,
}: {
  activePage: UserPage;
  onNavigate: (page: UserPage) => void;
  onSignOut: () => void;
}) {
  const items: readonly NavItem<UserPage>[] = [
    { icon: "home", label: "Home", page: "home" },
    { icon: "kudos", label: "Send Kudos", page: "send-kudos" },
    { icon: "benefits", label: "Recovery Benefits", page: "recovery-benefits" },
    { icon: "profile", label: "Profile", page: "profile" },
  ];

  return (
    <AppNavigation
      ariaLabel="Employee navigation"
      items={items}
      activePage={activePage}
      supportTitle="Confidential care"
      supportSubtitle="Check-ins stay 100% private"
      onNavigate={onNavigate}
      onSignOut={onSignOut}
    />
  );
}

function EmployeeHeader({
  name,
  points,
  onOpenBenefits,
  onOpenProfile,
}: {
  name: string;
  points: number;
  onOpenBenefits: () => void;
  onOpenProfile: () => void;
}) {
  const [query, setQuery] = useState("");
  return (
    <header className="dashboard-header">
      <div>
        <h1>Hi, {name}!</h1>
        <p>Check in with yourself, celebrate teammates, and recharge at your pace.</p>
      </div>
      <div className="header-actions">
        <label className="search-box">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4 4" />
          </svg>
          <input
            aria-label="Search workspace"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search teammates or benefits..."
          />
          <kbd>⌘ K</kbd>
        </label>
        <button
          type="button"
          className="header-points-pill"
          onClick={onOpenBenefits}
          aria-label={`${points} appreciation points`}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m12 2.5 2.6 5.4 6 .8-4.3 4.2 1 5.9L12 16l-5.3 2.8 1-5.9-4.3-4.2 6-.8L12 2.5Z" />
          </svg>
          <span>{points} pts</span>
        </button>
        <button type="button" className="icon-button" aria-label="Notifications">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7M10 20h4" />
          </svg>
          <span className="notification-dot" />
        </button>
        <button
          type="button"
          className="avatar avatar-btn"
          onClick={onOpenProfile}
          aria-label={`${name} profile`}
        >
          {name.slice(0, 1).toUpperCase()}
        </button>
      </div>
    </header>
  );
}

function RecipientPicker({
  selected,
  search,
  onSearchChange,
  onSelect,
  onClear,
}: {
  selected: Teammate | null;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (person: Teammate) => void;
  onClear: () => void;
}) {
  const matches = teammates.filter(
    (person) =>
      (!selected || person.name !== selected.name) &&
      `${person.name} ${person.department}`.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="recipient-picker">
      <div className="recipient-search-field">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4 4" />
        </svg>
        {selected && (
          <span className="recipient-chip">
            <i className="chip-avatar">{selected.name[0]}</i>
            {selected.name} - {selected.department}
            <button type="button" onClick={onClear} aria-label={`Remove ${selected.name}`}>
              ×
            </button>
          </span>
        )}
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={selected ? "Switch teammate..." : "Search teammate by name or department..."}
          aria-label="Search teammate"
        />
      </div>
      {(search.trim().length > 0 || !selected) && matches.length > 0 && (
        <div className="recipient-suggestions">
          {matches.slice(0, 4).map((person) => (
            <button
              key={person.name}
              type="button"
              onClick={() => {
                onSelect(person);
                onSearchChange("");
              }}
            >
              <span className="suggestion-initial">{person.name[0]}</span>
              <span>
                {person.name} - {person.department}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function UserHomeContent({
  userName,
  points,
  kudosFeed,
  onSubmitCheckIn,
  onSendKudos,
  onNavigate,
}: {
  userName: string;
  points: number;
  kudosFeed: KudosEntry[];
  onSubmitCheckIn: (moodKey: MoodKey, moodLabel: string, energy: number) => void;
  onSendKudos: (payload: {
    recipient: Teammate;
    badge: string;
    points: number;
    message: string;
    color: "teal" | "purple" | "orange" | "blue";
  }) => void;
  onNavigate: (page: UserPage) => void;
}) {
  const [selectedMood, setSelectedMood] = useState<MoodKey>("neutral");
  const [energy, setEnergy] = useState(70);
  const [checkInSaved, setCheckInSaved] = useState(false);

  const [recipient, setRecipient] = useState<Teammate | null>(teammates[0]);
  const [recipientQuery, setRecipientQuery] = useState("");
  const [selectedBadge, setSelectedBadge] = useState("Team Player");
  const [selectedPoints, setSelectedPoints] = useState<number>(150);
  const [message, setMessage] = useState("");
  const [kudosStatus, setKudosStatus] = useState("");

  const activeMoodObj = moodOptions.find((option) => option.key === selectedMood) ?? moodOptions[2];

  const handleCheckIn = () => {
    onSubmitCheckIn(selectedMood, activeMoodObj.statusLabel, energy);
    setCheckInSaved(true);
  };

  const handleKudosSubmit = (event: FormEvent) => {
    event.preventDefault();
    const target = recipient ?? teammates[0];
    const badgeInfo =
      userBadgeOptions.find((item) => item.name === selectedBadge) ?? userBadgeOptions[0];
    const cleanMessage =
      message.trim() ||
      `Thank you ${target.name} for stepping up and keeping our workflow running smoothly!`;
    onSendKudos({
      recipient: target,
      badge: selectedBadge,
      points: selectedPoints,
      message: cleanMessage,
      color: badgeInfo.color,
    });
    setMessage("");
    setKudosStatus(`Kudos sent to ${target.name} (+${selectedPoints} pts added to live feed).`);
  };

  return (
    <section className="user-page">
      <div className="user-home-grid">
        <div className="user-col">
          <article className="dashboard-card mood-checkin-card">
            <div className="card-title-row">
              <div>
                <span className="eyebrow">DAILY REFLECTION</span>
                <h2>Daily Mood Check-in</h2>
                <p className="card-subcopy">How are you feeling today?</p>
              </div>
              <span className="mood-status-pill">{activeMoodObj.statusLabel}</span>
            </div>
            <div
              className="mood-selector"
              role="radiogroup"
              aria-label="How are you feeling today?"
            >
              {moodOptions.map((option) => {
                const active = option.key === selectedMood;
                return (
                  <button
                    key={option.key}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    className={`mood-option ${active ? "active" : ""}`}
                    onClick={() => {
                      setSelectedMood(option.key);
                      setCheckInSaved(false);
                    }}
                  >
                    <span className="mood-circle">
                      <MoodFaceIcon mood={option.key} />
                    </span>
                    <span className="mood-name">{option.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="checkin-privacy-row">
              <LockIcon />
              <span>Private to {userName} · Only anonymized team trends reach HR</span>
            </div>
          </article>

          <article className="dashboard-card energy-card">
            <div className="card-title-row">
              <div>
                <span className="eyebrow">VITALITY PULSE</span>
                <h2>Energy Level</h2>
                <p className="card-subcopy">Slide to log your focus &amp; physical stamina</p>
              </div>
              <strong className="energy-readout">{energy}%</strong>
            </div>
            <div className="energy-slider-block">
              <input
                type="range"
                min={0}
                max={100}
                value={energy}
                aria-label="Energy Level"
                style={{ "--fill": `${energy}%` } as CSSProperties}
                onChange={(event) => {
                  setEnergy(Number(event.target.value));
                  setCheckInSaved(false);
                }}
                className="gradient-slider"
              />
              <div className="slider-scale">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
            <button type="button" className="primary-button full-width-btn" onClick={handleCheckIn}>
              Submit Check-in
            </button>
            {checkInSaved && (
              <div className="mint-feedback">
                <span>✓</span>
                <p>
                  Check-in saved ({activeMoodObj.statusLabel}, {energy}% energy). Logged to your{" "}
                  <button type="button" onClick={() => onNavigate("profile")}>
                    personal wellness history
                  </button>
                  .
                </p>
              </div>
            )}
          </article>

          <article className="dashboard-card mini-feed-card">
            <div className="card-title-row">
              <div>
                <span className="eyebrow">LIVE KUDOS FEED</span>
                <h2>Recent Team Appreciation</h2>
              </div>
              <button type="button" className="view-all" onClick={() => onNavigate("send-kudos")}>
                Open full view →
              </button>
            </div>
            <div className="mini-feed-list">
              {kudosFeed.slice(0, 2).map((entry) => (
                <div className="mini-feed-row" key={entry.id}>
                  <span className={`person-avatar ${entry.color}`}>{entry.from[0]}</span>
                  <div>
                    <p>
                      <strong>{entry.from}</strong> recognized <strong>{entry.to}</strong>{" "}
                      <span className={`badge-chip ${entry.color}`}>★ {entry.badge}</span>
                    </p>
                    <small>“{entry.message}”</small>
                  </div>
                  <em className="points-badge">+{entry.points} pts</em>
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="user-col">
          <article className="compact-balance-card">
            <div>
              <span className="balance-eyebrow">AVAILABLE REWARD BALANCE</span>
              <strong>{points} pts</strong>
              <p>Earned from peer kudos &amp; mindful check-in streaks</p>
            </div>
            <button
              type="button"
              className="balance-cta"
              onClick={() => onNavigate("recovery-benefits")}
            >
              Redeem Benefits <span>→</span>
            </button>
          </article>

          <article className="dashboard-card quick-kudos-card">
            <div className="card-title-row">
              <div>
                <span className="eyebrow">PEER APPRECIATION</span>
                <h2>Send Kudos</h2>
              </div>
              <button type="button" className="view-all" onClick={() => onNavigate("send-kudos")}>
                Expanded view
              </button>
            </div>
            <form className="quick-kudos-form" onSubmit={handleKudosSubmit}>
              <div className="kudos-field">
                <span className="field-label">Recipient</span>
                <RecipientPicker
                  selected={recipient}
                  search={recipientQuery}
                  onSearchChange={setRecipientQuery}
                  onSelect={setRecipient}
                  onClear={() => setRecipient(null)}
                />
              </div>

              <div className="kudos-field">
                <span className="field-label">Select Badge</span>
                <div className="badge-select-grid">
                  {userBadgeOptions.map((badge) => {
                    const active = selectedBadge === badge.name;
                    return (
                      <button
                        key={badge.name}
                        type="button"
                        className={`selectable-badge ${active ? "active" : ""}`}
                        onClick={() => setSelectedBadge(badge.name)}
                      >
                        <span className={`badge-glyph ${badge.color}`}>{badge.icon}</span>
                        <div>
                          <strong>{badge.name}</strong>
                          <small>{badge.tagline}</small>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="kudos-field">
                <span className="field-label">Point Boost</span>
                <div className="point-selector">
                  {pointChoices.map((pts) => (
                    <button
                      key={pts}
                      type="button"
                      className={selectedPoints === pts ? "active" : ""}
                      onClick={() => setSelectedPoints(pts)}
                    >
                      +{pts} pts
                    </button>
                  ))}
                </div>
              </div>

              <label className="kudos-field">
                <span className="field-label">Appreciation Message</span>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(event) => {
                    setMessage(event.target.value);
                    setKudosStatus("");
                  }}
                  placeholder="Share how Fadli A. made a difference today..."
                />
              </label>

              {kudosStatus && (
                <div className="mint-feedback">
                  <span>★</span>
                  <p>{kudosStatus}</p>
                </div>
              )}

              <button type="submit" className="primary-button full-width-btn">
                Send Kudos
              </button>
            </form>
          </article>
        </div>
      </div>
    </section>
  );
}

function SendKudosPage({
  userName,
  kudosFeed,
  onSendKudos,
}: {
  userName: string;
  kudosFeed: KudosEntry[];
  onSendKudos: (payload: {
    recipient: Teammate;
    badge: string;
    points: number;
    message: string;
    color: "teal" | "purple" | "orange" | "blue";
  }) => void;
}) {
  const [recipient, setRecipient] = useState<Teammate | null>(teammates[0]);
  const [recipientQuery, setRecipientQuery] = useState("");
  const [selectedBadge, setSelectedBadge] = useState("Team Player");
  const [selectedPoints, setSelectedPoints] = useState<number>(250);
  const [impactArea, setImpactArea] = useState("Cross-team Delivery");
  const [message, setMessage] = useState(
    "Thank you for jumping on the IT rollout issue right away and keeping the whole squad unblocked!",
  );
  const [historyTab, setHistoryTab] = useState<"sent" | "received">("sent");
  const [banner, setBanner] = useState("");

  const previewTarget = recipient ?? teammates[0];
  const activeBadge =
    userBadgeOptions.find((item) => item.name === selectedBadge) ?? userBadgeOptions[0];

  const submitExpanded = (event: FormEvent) => {
    event.preventDefault();
    const cleanMsg =
      message.trim() ||
      `Huge appreciation to ${previewTarget.name} for exemplifying ${selectedBadge}!`;
    onSendKudos({
      recipient: previewTarget,
      badge: selectedBadge,
      points: selectedPoints,
      message: cleanMsg,
      color: activeBadge.color,
    });
    setMessage("");
    setHistoryTab("sent");
    setBanner(`Sent +${selectedPoints} pts "${selectedBadge}" kudos to ${previewTarget.name}!`);
  };

  const receivedHistory: KudosEntry[] = [
    {
      id: "rec-1",
      from: "Maya R.",
      to: userName,
      badge: "Problem Solver",
      department: "Engineering",
      message: "Your calm troubleshooting during release QA saved our Friday deploy!",
      points: 250,
      celebrations: 14,
      time: "Yesterday",
      color: "purple",
    },
    {
      id: "rec-2",
      from: "Aris",
      to: userName,
      badge: "Team Player",
      department: "Product",
      message: "Always thoughtful in standups and generous with feedback.",
      points: 150,
      celebrations: 9,
      time: "4 days ago",
      color: "teal",
    },
  ];

  const sentItems = kudosFeed.filter(
    (item) => item.from === userName || item.id === "k1" || item.id === "k4",
  );
  const displayedHistory = historyTab === "sent" ? sentItems : receivedHistory;

  return (
    <section className="user-page">
      <PageIntro
        eyebrow="RECOGNITION STUDIO"
        title="Send Kudos"
        description="Craft a meaningful recognition card, preview it live, and review your appreciation history."
        showPrivacy={false}
      />

      <div className="send-kudos-layout">
        <article className="dashboard-card expanded-kudos-form-card">
          <div className="card-title-row">
            <div>
              <span className="eyebrow">NEW APPRECIATION</span>
              <h2>Expanded Recognition Form</h2>
            </div>
            <span className="accuracy-pill">Instant +pts boost</span>
          </div>
          <form className="quick-kudos-form" onSubmit={submitExpanded}>
            <div className="kudos-field">
              <span className="field-label">Teammate</span>
              <RecipientPicker
                selected={recipient}
                search={recipientQuery}
                onSearchChange={setRecipientQuery}
                onSelect={setRecipient}
                onClear={() => setRecipient(null)}
              />
              <div className="teammate-quick-row">
                {teammates.map((person) => (
                  <button
                    key={person.name}
                    type="button"
                    className={previewTarget.name === person.name ? "active" : ""}
                    onClick={() => setRecipient(person)}
                  >
                    {person.name} · {person.department}
                  </button>
                ))}
              </div>
            </div>

            <div className="kudos-field">
              <span className="field-label">Recognition Badge</span>
              <div className="badge-select-grid">
                {userBadgeOptions.map((badge) => (
                  <button
                    key={badge.name}
                    type="button"
                    className={`selectable-badge ${selectedBadge === badge.name ? "active" : ""}`}
                    onClick={() => setSelectedBadge(badge.name)}
                  >
                    <span className={`badge-glyph ${badge.color}`}>{badge.icon}</span>
                    <div>
                      <strong>{badge.name}</strong>
                      <small>{badge.tagline}</small>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="expanded-split">
              <div className="kudos-field">
                <span className="field-label">Appreciation Points</span>
                <div className="point-selector">
                  {pointChoices.map((pts) => (
                    <button
                      key={pts}
                      type="button"
                      className={selectedPoints === pts ? "active" : ""}
                      onClick={() => setSelectedPoints(pts)}
                    >
                      +{pts} pts
                    </button>
                  ))}
                </div>
              </div>
              <label className="kudos-field">
                <span className="field-label">Impact Context</span>
                <select
                  className="impact-select"
                  value={impactArea}
                  onChange={(event) => setImpactArea(event.target.value)}
                >
                  <option>Cross-team Delivery</option>
                  <option>Customer Launch</option>
                  <option>Mentorship &amp; Care</option>
                  <option>Operational Excellence</option>
                </select>
              </label>
            </div>

            <label className="kudos-field">
              <span className="field-label">Personal Note</span>
              <textarea
                rows={4}
                value={message}
                onChange={(event) => {
                  setMessage(event.target.value);
                  setBanner("");
                }}
                placeholder="Write a specific, heartfelt shout-out..."
              />
            </label>

            {banner && (
              <div className="mint-feedback">
                <span>★</span>
                <p>{banner}</p>
              </div>
            )}

            <button type="submit" className="primary-button full-width-btn">
              Send Kudos to {previewTarget.name}
            </button>
          </form>
        </article>

        <div className="kudos-right-stack">
          <article className="dashboard-card live-preview-card">
            <div className="card-title-row">
              <div>
                <span className="eyebrow">REAL-TIME CARD</span>
                <h2>Live Kudos Preview</h2>
              </div>
              <span className="live-badge">
                <i /> Live Preview
              </span>
            </div>
            <div className={`kudos-preview-stage ${activeBadge.color}`}>
              <div className="preview-stage-top">
                <span className={`badge-chip ${activeBadge.color}`}>★ {selectedBadge}</span>
                <span className="points-badge">♥ +{selectedPoints} pts</span>
              </div>
              <div className="preview-people">
                <div className="person-avatar teal">{userName[0]?.toUpperCase() || "U"}</div>
                <span className="preview-arrow">→</span>
                <div className={`person-avatar ${activeBadge.color}`}>{previewTarget.name[0]}</div>
                <div>
                  <strong>
                    {userName} → {previewTarget.name}
                  </strong>
                  <small>
                    {previewTarget.department} · {impactArea}
                  </small>
                </div>
              </div>
              <blockquote>
                “
                {message.trim() ||
                  `Thank you ${previewTarget.name} for making an impact with your ${selectedBadge.toLowerCase()} spirit!`}
                ”
              </blockquote>
              <div className="preview-stage-foot">
                <span>Publishes to company-wide Kudos Feed</span>
                <span>Just now</span>
              </div>
            </div>
          </article>

          <article className="dashboard-card history-card">
            <div className="history-head">
              <div>
                <span className="eyebrow">YOUR RECOGNITION LOG</span>
                <h2>Appreciation History</h2>
              </div>
              <div className="history-tabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={historyTab === "sent"}
                  className={historyTab === "sent" ? "active" : ""}
                  onClick={() => setHistoryTab("sent")}
                >
                  Sent ({sentItems.length})
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={historyTab === "received"}
                  className={historyTab === "received" ? "active" : ""}
                  onClick={() => setHistoryTab("received")}
                >
                  Received ({receivedHistory.length})
                </button>
              </div>
            </div>
            <div className="history-list">
              {displayedHistory.slice(0, 4).map((entry) => (
                <div className="history-row" key={entry.id}>
                  <span className={`person-avatar ${entry.color}`}>
                    {(historyTab === "sent" ? entry.to : entry.from)[0]}
                  </span>
                  <div className="history-copy">
                    <p>
                      {historyTab === "sent" ? (
                        <>
                          To <strong>{entry.to}</strong>
                        </>
                      ) : (
                        <>
                          From <strong>{entry.from}</strong>
                        </>
                      )}{" "}
                      <span className={`badge-chip ${entry.color}`}>★ {entry.badge}</span>
                    </p>
                    <small>“{entry.message}”</small>
                    <span>
                      {entry.department} · {entry.time}
                    </span>
                  </div>
                  <em className="points-badge">+{entry.points} pts</em>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function RecoveryBenefitsPage({
  points,
  claimedCount,
  onRedeem,
}: {
  points: number;
  claimedCount: number;
  onRedeem: (reward: (typeof recoveryRewards)[number]) => ClaimedVoucher | null;
}) {
  const [activeVoucher, setActiveVoucher] = useState<ClaimedVoucher | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRedeemClick = (reward: (typeof recoveryRewards)[number]) => {
    const voucher = onRedeem(reward);
    if (voucher) {
      setCopied(false);
      setActiveVoucher(voucher);
    }
  };

  const copyVoucher = (code: string) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopied(true);
  };

  return (
    <section className="user-page">
      <div className="recovery-hero">
        <div className="recovery-hero-copy">
          <span className="balance-eyebrow">RECOVERY BENEFITS WALLET</span>
          <h2>{points} pts</h2>
          <p>
            Redeem your appreciation points for restorative time off, clinical counseling, or
            physical wellness memberships.
          </p>
        </div>
        <div className="recovery-hero-stats">
          <div>
            <span>Available Balance</span>
            <strong>{points} pts</strong>
          </div>
          <div>
            <span>Claimed Vouchers</span>
            <strong>{claimedCount} active</strong>
          </div>
        </div>
      </div>

      <div className="catalog-head">
        <div>
          <span className="eyebrow">CURATED RECOVERY CATALOG</span>
          <h3>Rest &amp; Wellbeing Rewards</h3>
        </div>
        <span className="catalog-count">Instant voucher code issued upon redemption</span>
      </div>

      <div className="benefit-grid">
        {recoveryRewards.map((reward) => {
          const affordable = points >= reward.points;
          return (
            <article className="dashboard-card benefit-card user-reward-card" key={reward.id}>
              <div className={`benefit-visual ${reward.color}`}>
                <span>
                  <BenefitIcon category={reward.category} />
                </span>
                <small>{reward.category}</small>
                <em className="benefit-state on">{reward.points} pts</em>
              </div>
              <div className="benefit-body user-reward-body">
                <h3>{reward.name}</h3>
                <span className="reward-partner">{reward.partner}</span>
                <p className="reward-desc">{reward.description}</p>
                <div className="reward-action-row">
                  <strong>
                    {reward.points} <small>pts</small>
                  </strong>
                  <button
                    type="button"
                    disabled={!affordable}
                    className={affordable ? "redeem-btn" : "redeem-btn disabled"}
                    onClick={() => handleRedeemClick(reward)}
                  >
                    {affordable ? "Redeem" : `Need ${reward.points - points} more pts`}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {activeVoucher && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={() => setActiveVoucher(null)}
        >
          <div
            className="benefit-modal voucher-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="voucher-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <span className="eyebrow">REDEMPTION CONFIRMED</span>
                <h2 id="voucher-modal-title">Voucher Ready to Use</h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveVoucher(null)}
                aria-label="Close confirmation"
              >
                ×
              </button>
            </div>
            <p className="voucher-summary">
              <strong>{activeVoucher.rewardName}</strong> has been redeemed for{" "}
              <strong>{activeVoucher.pointsCost} pts</strong>. Your updated balance is{" "}
              <strong>{points} pts</strong>.
            </p>
            <div className="voucher-code-box">
              <div>
                <span>VOUCHER CODE</span>
                <strong>{activeVoucher.code}</strong>
                <small>
                  Partner: {activeVoucher.partner} · Valid thru {activeVoucher.expiresAt}
                </small>
              </div>
              <button
                type="button"
                className="outline-button"
                onClick={() => copyVoucher(activeVoucher.code)}
              >
                {copied ? "Copied!" : "Copy Code"}
              </button>
            </div>
            <div className="mint-feedback">
              <span>✓</span>
              <p>Saved automatically to your Profile under Claimed Voucher Codes.</p>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="primary-button"
                onClick={() => setActiveVoucher(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function UserProfilePage({
  profile,
  points,
  vouchers,
  moodLogs,
  onNavigateBenefits,
}: {
  profile: EmployeeProfile;
  points: number;
  vouchers: ClaimedVoucher[];
  moodLogs: MoodCheckInEntry[];
  onNavigateBenefits: () => void;
}) {
  const [copiedId, setCopiedId] = useState("");

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedId(id);
  };

  return (
    <section className="user-page">
      <PageIntro
        eyebrow="EMPLOYEE WORKSPACE"
        title="Profile"
        description="Your employee details, claimed recovery vouchers, and private mood check-in log."
      />

      <article className="dashboard-card profile-header-card">
        <div className="profile-identity">
          <div className="profile-avatar-lg">{profile.fullName.slice(0, 1).toUpperCase()}</div>
          <div>
            <span className="eyebrow">ACTIVE MEMBER</span>
            <h3>{profile.fullName}</h3>
            <p>
              @{profile.username} · {profile.department} Department
            </p>
            <div className="profile-badges">
              <span className="privacy-pill table-badge">
                <LockIcon /> Personal logs encrypted
              </span>
              <span className="accuracy-pill">5-day check-in streak</span>
            </div>
          </div>
        </div>
        <div className="profile-metrics">
          <div>
            <span>Reward Balance</span>
            <strong>{points} pts</strong>
          </div>
          <div>
            <span>Claimed Vouchers</span>
            <strong>{vouchers.length}</strong>
          </div>
          <div>
            <span>Mood Check-ins</span>
            <strong>{moodLogs.length}</strong>
          </div>
        </div>
      </article>

      <div className="profile-columns">
        <article className="dashboard-card profile-section-card">
          <div className="card-title-row">
            <div>
              <span className="eyebrow">REDEEMED REWARDS</span>
              <h2>Claimed Voucher Codes</h2>
            </div>
            <button type="button" className="view-all" onClick={onNavigateBenefits}>
              Redeem more →
            </button>
          </div>
          <div className="voucher-log-list">
            {vouchers.map((voucher) => (
              <div className="voucher-log-item" key={voucher.id}>
                <div>
                  <strong>{voucher.rewardName}</strong>
                  <small>
                    {voucher.partner} · Claimed {voucher.claimedAt} · Expires {voucher.expiresAt}
                  </small>
                  <div className="voucher-inline-code">
                    <code>{voucher.code}</code>
                    <button type="button" onClick={() => handleCopy(voucher.id, voucher.code)}>
                      {copiedId === voucher.id ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
                <div className="voucher-log-meta">
                  <span className="status-pill">{voucher.status}</span>
                  <em>-{voucher.pointsCost} pts</em>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-card profile-section-card">
          <div className="card-title-row">
            <div>
              <span className="eyebrow">PRIVATE WELLBEING JOURNAL</span>
              <h2>Personal Mood Check-in Log</h2>
            </div>
            <span className="privacy-pill table-badge">
              <LockIcon /> Only visible to you
            </span>
          </div>
          <div className="mood-log-list">
            {moodLogs.map((entry) => (
              <div className="mood-log-item" key={entry.id}>
                <span className="mood-log-icon">
                  <MoodFaceIcon mood={entry.moodKey} />
                </span>
                <div className="mood-log-copy">
                  <strong>{entry.moodLabel}</strong>
                  <small>{entry.timestamp}</small>
                </div>
                <div className="mood-log-energy">
                  <span>Energy {entry.energy}%</span>
                  <div>
                    <i style={{ width: `${entry.energy}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function EmployeeDashboard({
  profile,
  points,
  kudosFeed,
  vouchers,
  moodLogs,
  onSubmitCheckIn,
  onSendKudos,
  onRedeem,
  onSignOut,
}: {
  profile: EmployeeProfile;
  points: number;
  kudosFeed: KudosEntry[];
  vouchers: ClaimedVoucher[];
  moodLogs: MoodCheckInEntry[];
  onSubmitCheckIn: (moodKey: MoodKey, moodLabel: string, energy: number) => void;
  onSendKudos: (payload: {
    recipient: Teammate;
    badge: string;
    points: number;
    message: string;
    color: "teal" | "purple" | "orange" | "blue";
  }) => void;
  onRedeem: (reward: (typeof recoveryRewards)[number]) => ClaimedVoucher | null;
  onSignOut: () => void;
}) {
  const [page, setPage] = useState<UserPage>("home");

  return (
    <div className="dashboard-shell">
      <UserSidebar activePage={page} onNavigate={setPage} onSignOut={onSignOut} />
      <main className="dashboard-main">
        <EmployeeHeader
          name={profile.fullName}
          points={points}
          onOpenBenefits={() => setPage("recovery-benefits")}
          onOpenProfile={() => setPage("profile")}
        />
        {page === "home" && (
          <UserHomeContent
            userName={profile.fullName}
            points={points}
            kudosFeed={kudosFeed}
            onSubmitCheckIn={onSubmitCheckIn}
            onSendKudos={onSendKudos}
            onNavigate={setPage}
          />
        )}
        {page === "send-kudos" && (
          <SendKudosPage
            userName={profile.fullName}
            kudosFeed={kudosFeed}
            onSendKudos={onSendKudos}
          />
        )}
        {page === "recovery-benefits" && (
          <RecoveryBenefitsPage
            points={points}
            claimedCount={vouchers.length}
            onRedeem={onRedeem}
          />
        )}
        {page === "profile" && (
          <UserProfilePage
            profile={profile}
            points={points}
            vouchers={vouchers}
            moodLogs={moodLogs}
            onNavigateBenefits={() => setPage("recovery-benefits")}
          />
        )}
      </main>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("sign-in");
  const [accounts, setAccounts] = useState<EmployeeProfile[]>([]);
  const [activeEmployee, setActiveEmployee] = useState<EmployeeProfile>({
    fullName: "User",
    username: "user",
    department: "Product & Design",
  });
  const [userPoints, setUserPoints] = useState(850);
  const [kudosFeed, setKudosFeed] = useState<KudosEntry[]>(initialKudosItems);
  const [claimedVouchers, setClaimedVouchers] = useState<ClaimedVoucher[]>([
    {
      id: "v-initial",
      rewardName: "Fitness & Gym Voucher",
      partner: "FitPass Corporate Network",
      pointsCost: 250,
      code: "BM-FIT-7392",
      claimedAt: "Last week",
      expiresAt: "Jun 30, 2025",
      status: "Active",
    },
  ]);
  const [moodLogs, setMoodLogs] = useState<MoodCheckInEntry[]>([
    {
      id: "m-1",
      moodKey: "neutral",
      moodLabel: "Calm/Good",
      energy: 74,
      timestamp: "Yesterday · 9:12 AM",
    },
    {
      id: "m-2",
      moodKey: "happy",
      moodLabel: "Upbeat / Happy",
      energy: 82,
      timestamp: "2 days ago · 9:05 AM",
    },
    {
      id: "m-3",
      moodKey: "energetic",
      moodLabel: "Peak / Energetic",
      energy: 88,
      timestamp: "3 days ago · 8:54 AM",
    },
  ]);

  const login = (username: string, password: string) => {
    if (username === "admin" && password === "admin") {
      setScreen("admin");
      return true;
    }
    if (username === "user" && password === "user") {
      setActiveEmployee({
        fullName: "User",
        username: "user",
        department: "Product & Design",
      });
      setScreen("user");
      return true;
    }
    const matched = accounts.find(
      (account) => account.username === username && account.password === password,
    );
    if (matched) {
      setActiveEmployee(matched);
      setScreen("user");
      return true;
    }
    return false;
  };

  const handleCheckIn = (moodKey: MoodKey, moodLabel: string, energy: number) => {
    setMoodLogs((current) => [
      {
        id: `m-${Date.now()}`,
        moodKey,
        moodLabel,
        energy,
        timestamp: "Today · Just now",
      },
      ...current,
    ]);
  };

  const handleSendKudos = ({
    recipient,
    badge,
    points,
    message,
    color,
  }: {
    recipient: Teammate;
    badge: string;
    points: number;
    message: string;
    color: "teal" | "purple" | "orange" | "blue";
  }) => {
    setKudosFeed((current) => [
      {
        id: `k-${Date.now()}`,
        from: activeEmployee.fullName,
        to: recipient.name,
        badge,
        department: recipient.department,
        message,
        points,
        celebrations: 1,
        time: "Just now",
        color,
      },
      ...current,
    ]);
  };

  const handleRedeemReward = (reward: (typeof recoveryRewards)[number]): ClaimedVoucher | null => {
    if (userPoints < reward.points) return null;
    const suffix = String(1000 + ((claimedVouchers.length * 173 + userPoints) % 8999));
    const voucher: ClaimedVoucher = {
      id: `v-${Date.now()}`,
      rewardName: reward.name,
      partner: reward.partner,
      pointsCost: reward.points,
      code: `${reward.codePrefix}-${suffix}`,
      claimedAt: "Today",
      expiresAt: "Dec 31, 2025",
      status: "Active",
    };
    setUserPoints((current) => current - reward.points);
    setClaimedVouchers((current) => [voucher, ...current]);
    return voucher;
  };

  if (screen === "sign-up") {
    return (
      <SignUp
        onNavigate={() => setScreen("sign-in")}
        onSignUp={(account) => {
          setAccounts((current) => [...current, account]);
          setActiveEmployee(account);
          setUserPoints(850);
          setScreen("user");
        }}
      />
    );
  }
  if (screen === "admin") {
    return <AdminDashboard kudosFeed={kudosFeed} onSignOut={() => setScreen("sign-in")} />;
  }
  if (screen === "user") {
    return (
      <EmployeeDashboard
        profile={activeEmployee}
        points={userPoints}
        kudosFeed={kudosFeed}
        vouchers={claimedVouchers}
        moodLogs={moodLogs}
        onSubmitCheckIn={handleCheckIn}
        onSendKudos={handleSendKudos}
        onRedeem={handleRedeemReward}
        onSignOut={() => setScreen("sign-in")}
      />
    );
  }
  return <SignIn onNavigate={() => setScreen("sign-up")} onLogin={login} />;
}
