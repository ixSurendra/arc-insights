import {
  ArrowRight,
  Database,
  Github,
  KeyRound,
  Layers,
  Lock,
  Play,
  Sparkles,
  TerminalSquare,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createArcInsights } from "@arc-insights/sdk";
import { Chart } from "../charts/Chart";
import { RichBigNumber } from "../charts/RichBigNumber";
import type { ChartConfig, ChartData } from "../charts/types";

const client = createArcInsights();

const sampleSeries: ChartData = {
  rows: [
    { month: "Jan", NA: 18000, EU: 12000, APAC: 6000 },
    { month: "Feb", NA: 22000, EU: 15000, APAC: 7500 },
    { month: "Mar", NA: 24000, EU: 17500, APAC: 9000 },
    { month: "Apr", NA: 27000, EU: 16000, APAC: 9500 },
    { month: "May", NA: 30000, EU: 21000, APAC: 11000 },
    { month: "Jun", NA: 35000, EU: 24000, APAC: 13000 },
  ],
};

const heroChartConfig: ChartConfig = {
  type: "line",
  xAxis: "month",
  yAxes: ["NA", "EU", "APAC"],
  area: true,
  valueFormat: "currency",
  currency: "USD",
};

export function OverviewPage() {
  return (
    <div style={{ overflow: "hidden" }}>
      <Hero />
      <Marquee />
      <FeatureSection
        eyebrow="Embed-first"
        title="Drop dashboards into your customer's product."
        body="Signed-JWT iframes plus React, Vue, and vanilla SDKs. White-label via CSS custom properties — your customers brand it without a recompile."
        icon={Layers}
        side="right"
      >
        <EmbedPreviewCard />
      </FeatureSection>
      <FeatureSection
        eyebrow="On-prem · Air-gapped"
        title="Yours from day one. Including the air-gapped ones."
        body="Single distroless binary. Helm chart with HA. License-key activation that works offline. BYOK across AWS / Azure / GCP / Vault. No phoning home."
        icon={Lock}
        side="left"
      >
        <TerminalPreviewCard />
      </FeatureSection>
      <FeatureSection
        eyebrow="Cost transparency"
        title="Know what every chart costs to run."
        body="Per-query dollar estimates on Snowflake and BigQuery. Per-tenant budgets. Soft warnings at 80%, hard cap at 100%. Auto-pause runaway queries before they blow up your bill."
        icon={Wallet}
        side="right"
      >
        <CostPreviewCard />
      </FeatureSection>
      <StatStrip />
      <BigCTA />
      <FooterStrip />
    </div>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────
function Hero() {
  return (
    <section
      style={{
        position: "relative",
        padding: "var(--space-20) var(--space-6) var(--space-12)",
        background: "var(--gradient-hero)",
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          textAlign: "center",
          animation: "arc-fade-up 600ms var(--ease) both",
        }}
      >
        <Eyebrow>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--color-primary)",
              display: "inline-block",
              boxShadow: "0 0 12px var(--color-primary)",
            }}
          />
          Open source · Self-hostable · AGPLv3
        </Eyebrow>
        <h1
          style={{
            margin: "var(--space-4) auto 0",
            fontSize: "clamp(40px, 6vw, var(--text-5xl))",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: "var(--leading-tight)",
            maxWidth: 920,
            background:
              "linear-gradient(180deg, var(--color-fg) 0%, var(--color-fg-muted) 130%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          The analytics platform that{" "}
          <span
            style={{
              background:
                "linear-gradient(90deg, var(--color-primary), var(--color-accent))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            ships with you
          </span>
          .
        </h1>
        <p
          style={{
            margin: "var(--space-5) auto 0",
            fontSize: "clamp(16px, 2vw, 18px)",
            color: "var(--color-fg-muted)",
            maxWidth: 660,
            lineHeight: "var(--leading-relaxed)",
          }}
        >
          Connect a database, build dashboards visually or with SQL, embed them
          anywhere — including on-prem and air-gapped customers nobody else can
          reach.
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "var(--space-3)",
            marginTop: "var(--space-8)",
            flexWrap: "wrap",
          }}
        >
          <CTAButton primary iconLeft={<Play size={16} />}>
            Get started — make dev
          </CTAButton>
          <CTAButton iconLeft={<Github size={16} />}>View on GitHub</CTAButton>
        </div>
      </div>

      {/* Floating product preview */}
      <ProductPreview />
    </section>
  );
}

function ProductPreview() {
  const [health, setHealth] = useState<string>("connecting…");

  useEffect(() => {
    void client.health
      .get()
      .then(({ data }) => {
        if (data?.status === "ok")
          setHealth(`${data.service} · ${data.version}`);
      })
      .catch(() => setHealth("offline"));
  }, []);

  return (
    <div
      style={{
        maxWidth: 1080,
        margin: "var(--space-12) auto 0",
        padding: "0 var(--space-3)",
        animation: "arc-fade-up 800ms 200ms var(--ease) both",
      }}
    >
      <div
        style={{
          background: "var(--color-bg-elev)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-2xl)",
          boxShadow: "var(--shadow-xl)",
          padding: "var(--space-2)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Window-frame title row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "var(--space-2) var(--space-4)",
            color: "var(--color-fg-subtle)",
            fontSize: 12,
            fontFamily: "var(--font-mono)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#ff5f57",
              }}
            />
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#febc2e",
              }}
            />
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#28c840",
              }}
            />
          </div>
          <span>arc-insights · {health}</span>
          <span aria-hidden style={{ width: 36 }} />
        </div>
        {/* Inner canvas */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 320px",
            gap: 0,
            background: "var(--color-bg)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div
            style={{
              padding: "var(--space-5) var(--space-5) var(--space-3)",
              borderRight: "1px solid var(--color-border)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--color-fg-subtle)",
                marginBottom: "var(--space-2)",
              }}
            >
              Revenue · last 6 months
            </div>
            <div style={{ height: 280 }}>
              <Chart
                config={heroChartConfig}
                data={sampleSeries}
                height={280}
              />
            </div>
          </div>
          <div style={{ padding: "var(--space-5)" }}>
            <RichBigNumber
              eyebrow="Q2 to date"
              label="Total revenue"
              value="$405k"
              delta="+14.2%"
              deltaDirection="up"
              deltaSuffix="vs prior"
              sparkline={[120, 135, 148, 162, 178, 195, 215, 240]}
              subStats={[
                { label: "Avg / mo", value: "$67.5k" },
                { label: "Best", value: "$84.2k" },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Marquee ───────────────────────────────────────────────────────
function Marquee() {
  const items = [
    "Postgres",
    "MySQL",
    "BigQuery",
    "Snowflake",
    "Redshift",
    "DuckDB",
    "ClickHouse",
    "Databricks",
    "S3 / Parquet",
    "Google Sheets",
    "REST",
    "MongoDB",
  ];
  // double for seamless loop
  const track = [...items, ...items];
  return (
    <section
      aria-label="Supported data sources"
      style={{
        padding: "var(--space-12) 0",
        borderTop: "1px solid var(--color-border)",
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-bg)",
      }}
    >
      <div
        style={{
          textAlign: "center",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-fg-subtle)",
          marginBottom: "var(--space-6)",
        }}
      >
        Connects to everything you already use
      </div>
      <div
        style={{
          maskImage:
            "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
          overflow: "hidden",
        }}
      >
        <ul
          className="arc-marquee"
          style={{
            margin: 0,
            padding: 0,
            listStyle: "none",
            color: "var(--color-fg-muted)",
            fontSize: "var(--text-md)",
            fontWeight: 500,
            letterSpacing: "-0.01em",
          }}
        >
          {track.map((item, i) => (
            <li
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--space-2)",
              }}
            >
              <Database size={14} style={{ color: "var(--color-fg-subtle)" }} />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ─── Feature section (alternating left/right) ──────────────────────
function FeatureSection({
  eyebrow,
  title,
  body,
  icon: Icon,
  side,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  icon: typeof Layers;
  side: "left" | "right";
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        padding: "var(--space-20) var(--space-6)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--space-12)",
          alignItems: "center",
        }}
      >
        <div
          style={{
            order: side === "left" ? 1 : 2,
          }}
        >
          <Eyebrow>
            <Icon size={12} />
            {eyebrow}
          </Eyebrow>
          <h2
            style={{
              margin: "var(--space-3) 0 0",
              fontSize: "clamp(28px, 4vw, var(--text-3xl))",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: "var(--leading-tight)",
              color: "var(--color-fg)",
              maxWidth: 480,
            }}
          >
            {title}
          </h2>
          <p
            style={{
              margin: "var(--space-4) 0 0",
              fontSize: "var(--text-md)",
              color: "var(--color-fg-muted)",
              lineHeight: "var(--leading-relaxed)",
              maxWidth: 480,
            }}
          >
            {body}
          </p>
        </div>
        <div style={{ order: side === "left" ? 2 : 1, minWidth: 0 }}>
          {children}
        </div>
      </div>
    </section>
  );
}

// ─── Per-feature visuals ───────────────────────────────────────────
function EmbedPreviewCard() {
  return (
    <div
      style={{
        background: "var(--color-bg-elev)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-xl)",
        padding: "var(--space-5)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontFamily: "var(--font-mono)",
          color: "var(--color-fg-subtle)",
          marginBottom: "var(--space-3)",
        }}
      >
        {"// your-app.tsx"}
      </div>
      <pre
        style={{
          margin: 0,
          fontSize: 12,
          fontFamily: "var(--font-mono)",
          background: "var(--color-bg)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-4)",
          color: "var(--color-fg)",
          overflowX: "auto",
        }}
      >
        <code>
          <span style={{ color: "var(--color-cell-sql)" }}>import</span>
          {" { "}Dashboard{" } "}
          <span style={{ color: "var(--color-cell-sql)" }}>from</span>{" "}
          <span style={{ color: "var(--color-cell-markdown)" }}>
            {`'@arc-insights/sdk'`}
          </span>
          ;{"\n\n"}
          {"<"}
          <span style={{ color: "var(--color-primary)" }}>Dashboard</span>{" "}
          <span style={{ color: "var(--color-cell-chart)" }}>id</span>=
          <span
            style={{ color: "var(--color-cell-markdown)" }}
          >{`"sales"`}</span>{" "}
          <span style={{ color: "var(--color-cell-chart)" }}>token</span>={"{"}
          signedJwt{"}"} {"/>"}
        </code>
      </pre>
    </div>
  );
}

function TerminalPreviewCard() {
  return (
    <div
      style={{
        background: "var(--color-bg-elev)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-xl)",
        padding: "var(--space-5)",
        boxShadow: "var(--shadow-md)",
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        lineHeight: "var(--leading-relaxed)",
      }}
    >
      <div
        style={{
          color: "var(--color-fg-subtle)",
          marginBottom: "var(--space-3)",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
        }}
      >
        <TerminalSquare size={14} />
        bash · single-binary install
      </div>
      <div style={{ color: "var(--color-fg)" }}>
        <div>
          <span style={{ color: "var(--color-cell-chart)" }}>$</span> curl -L
          arcinsights.io/install | sh
        </div>
        <div style={{ color: "var(--color-fg-muted)" }}>
          Verifying signature…{" "}
          <span style={{ color: "var(--color-success)" }}>ok</span>
        </div>
        <div style={{ color: "var(--color-fg-muted)" }}>
          Installed → /usr/local/bin/arc-insights
        </div>
        <div style={{ marginTop: "var(--space-2)" }}>
          <span style={{ color: "var(--color-cell-chart)" }}>$</span>{" "}
          arc-insights serve --license=./arc.lic
        </div>
        <div style={{ color: "var(--color-success)" }}>
          ▸ Listening on 0.0.0.0:3000
        </div>
        <div style={{ color: "var(--color-fg-subtle)" }}>
          ▸ Air-gapped · telemetry off · license 312 days
        </div>
      </div>
    </div>
  );
}

function CostPreviewCard() {
  return (
    <div
      style={{
        background: "var(--color-bg-elev)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-xl)",
        padding: "var(--space-5)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "var(--space-3)",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--color-fg-subtle)",
          }}
        >
          Q3 budget · Snowflake
        </span>
        <span
          style={{
            fontSize: 12,
            color: "var(--color-warning)",
            fontWeight: 600,
          }}
        >
          82% used
        </span>
      </div>
      <div
        style={{
          height: 8,
          background: "var(--color-bg-subtle)",
          borderRadius: "var(--radius-full)",
          overflow: "hidden",
          marginBottom: "var(--space-4)",
        }}
      >
        <div
          style={{
            width: "82%",
            height: "100%",
            background:
              "linear-gradient(90deg, var(--color-primary), var(--color-warning))",
          }}
        />
      </div>
      {[
        { label: "Daily report · acme-prod", cost: "$2.41" },
        { label: "Pipeline anomaly digest", cost: "$0.92" },
        { label: "Sales overview (auto-refresh)", cost: "$4.18" },
        { label: "Top 100 dashboards (rollup)", cost: "$1.07" },
      ].map((row) => (
        <div
          key={row.label}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "var(--space-2) 0",
            borderTop: "1px solid var(--color-border)",
            fontSize: 13,
            color: "var(--color-fg-muted)",
          }}
        >
          <span>{row.label}</span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-success)",
              fontWeight: 600,
            }}
          >
            {row.cost}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Stat strip ────────────────────────────────────────────────────
function StatStrip() {
  const stats = [
    { label: "Features", value: "157" },
    { label: "First-party connectors", value: "4 P0" },
    { label: "p99 query (uncached)", value: "838 ms" },
    { label: "License", value: "AGPLv3" },
  ];
  return (
    <section
      style={{
        padding: "var(--space-12) var(--space-6)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
          gap: "var(--space-6)",
        }}
      >
        {stats.map((s) => (
          <div key={s.label}>
            <div
              style={{
                fontSize: "clamp(28px, 4vw, var(--text-2xl))",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                background:
                  "linear-gradient(90deg, var(--color-fg), var(--color-primary))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--color-fg-subtle)",
                fontWeight: 500,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                marginTop: "var(--space-1)",
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Big CTA ───────────────────────────────────────────────────────
function BigCTA() {
  return (
    <section
      style={{
        padding: "var(--space-20) var(--space-6)",
        background: "var(--gradient-hero)",
        textAlign: "center",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <Eyebrow>
          <Sparkles size={12} />
          Ship in five minutes
        </Eyebrow>
        <h2
          style={{
            margin: "var(--space-4) 0 0",
            fontSize: "clamp(32px, 5vw, var(--text-3xl))",
            fontWeight: 700,
            letterSpacing: "-0.025em",
            lineHeight: "var(--leading-tight)",
          }}
        >
          One command. Postgres, Valkey,
          <br />
          your dev loop alive.
        </h2>
        <pre
          style={{
            margin: "var(--space-6) auto 0",
            display: "inline-block",
            padding: "var(--space-3) var(--space-5)",
            background: "var(--color-bg-elev)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            fontFamily: "var(--font-mono)",
            fontSize: 14,
            color: "var(--color-fg)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <span style={{ color: "var(--color-fg-subtle)" }}>$</span>{" "}
          <span style={{ color: "var(--color-primary)" }}>make</span> dev
        </pre>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "var(--space-3)",
            marginTop: "var(--space-6)",
            flexWrap: "wrap",
          }}
        >
          <CTAButton primary iconRight={<ArrowRight size={16} />}>
            Read the quickstart
          </CTAButton>
          <CTAButton iconLeft={<KeyRound size={16} />}>Talk to sales</CTAButton>
        </div>
      </div>
    </section>
  );
}

function FooterStrip() {
  return (
    <footer
      style={{
        padding: "var(--space-8) var(--space-6)",
        textAlign: "center",
        color: "var(--color-fg-subtle)",
        fontSize: 12,
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "var(--space-4)",
          flexWrap: "wrap",
        }}
      >
        <span>© 2026 Arc Insights · AGPLv3</span>
        <div style={{ display: "flex", gap: "var(--space-5)" }}>
          <a href="/dashboard" style={{ color: "inherit" }}>
            Notebook demo
          </a>
          <a href="/builder" style={{ color: "inherit" }}>
            Builder
          </a>
          <a href="/sql" style={{ color: "inherit" }}>
            SQL
          </a>
          <a
            href="https://github.com/ixSurendra/arc-insights"
            style={{ color: "inherit" }}
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}

// ─── Tiny shared bits ──────────────────────────────────────────────
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-2)",
        padding: "4px var(--space-3)",
        borderRadius: "var(--radius-full)",
        background: "var(--color-bg-elev)",
        border: "1px solid var(--color-border)",
        fontSize: 12,
        fontWeight: 500,
        color: "var(--color-fg-muted)",
        letterSpacing: "0.02em",
      }}
    >
      {children}
    </span>
  );
}

function CTAButton({
  children,
  primary,
  iconLeft,
  iconRight,
}: {
  children: React.ReactNode;
  primary?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-2)",
        height: 44,
        padding: "0 var(--space-5)",
        fontFamily: "inherit",
        fontSize: "var(--text-base)",
        fontWeight: 600,
        borderRadius: "var(--radius-md)",
        cursor: "pointer",
        transition:
          "background var(--motion-fast) var(--ease), border-color var(--motion-fast) var(--ease), transform var(--motion-fast) var(--ease)",
        background: primary ? "var(--color-primary)" : "var(--color-bg-elev)",
        color: primary ? "var(--color-primary-fg)" : "var(--color-fg)",
        border: primary
          ? "1px solid var(--color-primary)"
          : "1px solid var(--color-border)",
        boxShadow: primary ? "var(--shadow-glow)" : "var(--shadow-sm)",
      }}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}
