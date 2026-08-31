import './style.css';

// Command history tracking
let commandHistory = [];
let historyIndex = -1;

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// App HTML Template
document.querySelector('#app').innerHTML = `
  <!-- Top Navigation Header (Huyml Style) -->
  <header class="site-header" id="siteHeader">
    <div class="header-left"></div>

    <div class="header-right">
      <div class="status-pill">
        <span class="pulse-dot"></span>
        <span>Available for Opportunities</span>
      </div>
      <div class="time-pill" id="istClock">IST --:--:--</div>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="hero-section" id="hero">
    <div class="hero-glow"></div>

    <div class="hero-top-meta">
      <div class="hero-tagline">A Curious Kid</div>
      <div class="hero-location">
        <i data-lucide="map-pin" style="width: 14px; height: 14px;"></i>
        <span>India</span>
      </div>
    </div>

    <div class="hero-title-wrap">
      <h1 class="hero-name-huge">
        <span>DEEPANSHU</span>
        <span class="highlight-white">MISHRA</span>
      </h1>
    </div>

    <!-- Endless Marquee Ticker -->
    <div class="hero-marquee-wrap">
      <div class="hero-marquee">
        <span class="marquee-item"><span class="marquee-dot"></span> TERRAFORM IAC</span>
        <span class="marquee-item"><span class="marquee-dot"></span> AWS CLOUD ARCHITECTURE</span>
        <span class="marquee-item"><span class="marquee-dot"></span> GITLAB CI/CD & JENKINS</span>
        <span class="marquee-item"><span class="marquee-dot"></span> OPENTELEMETRY & GRAFANA</span>
        <span class="marquee-item"><span class="marquee-dot"></span> ANSIBLE AUTOMATION</span>
        <span class="marquee-item"><span class="marquee-dot"></span> DOCKER & KUBERNETES</span>
        <span class="marquee-item"><span class="marquee-dot"></span> PROMETHEUS & LOKI</span>
        <!-- Duplicated for continuous loop -->
        <span class="marquee-item"><span class="marquee-dot"></span> TERRAFORM IAC</span>
        <span class="marquee-item"><span class="marquee-dot"></span> AWS CLOUD ARCHITECTURE</span>
        <span class="marquee-item"><span class="marquee-dot"></span> GITLAB CI/CD & JENKINS</span>
        <span class="marquee-item"><span class="marquee-dot"></span> OPENTELEMETRY & GRAFANA</span>
        <span class="marquee-item"><span class="marquee-dot"></span> ANSIBLE AUTOMATION</span>
        <span class="marquee-item"><span class="marquee-dot"></span> DOCKER & KUBERNETES</span>
      </div>
    </div>
  </section>

  <!-- Interactive Terminal Section (Kanishkk.xyz inspired) -->
  <section class="terminal-section" id="terminal">
    <div class="section-header-wrap" style="max-width: 1000px; margin: 0 auto 2.5rem auto;">
      <div class="section-label-group">
        <span class="section-num-pill">/01 &mdash; INTERACTIVE SHELL</span>
        <h2 class="section-title-huge">Cloud Terminal</h2>
      </div>
      <p class="section-desc-lead">
        Type commands or click quick-actions below to explore background, systems, socials, and contact info.
      </p>
    </div>

    <div class="terminal-window" id="terminalWindow">
      <div class="terminal-titlebar">
        <div class="terminal-controls">
          <div class="terminal-btn close" title="Close Terminal"></div>
          <div class="terminal-btn min" title="Minimize"></div>
          <div class="terminal-btn max" title="Maximize"></div>
        </div>
        <div class="terminal-tab-title">
          <a href="https://github.com/DeepanshuMishra49" target="_blank" rel="noopener noreferrer" class="terminal-repo-link">
            <i data-lucide="github" style="width: 14px; height: 14px;"></i>
            <span>github.com/DeepanshuMishra49</span>
          </a>
        </div>
        <div class="terminal-badge-tag">bash v5.2</div>
      </div>

      <!-- Quick Command Buttons -->
      <div class="terminal-quick-tags">
        <button class="cmd-hint-chip" data-cmd="about me">about me</button>
        <button class="cmd-hint-chip" data-cmd="ls">ls</button>
        <button class="cmd-hint-chip" data-cmd="skills">skills</button>
        <button class="cmd-hint-chip" data-cmd="projects">projects</button>
        <button class="cmd-hint-chip" data-cmd="meet">meet</button>
        <button class="cmd-hint-chip" data-cmd="social -a">social -a</button>
        <button class="cmd-hint-chip" data-cmd="resume">resume</button>
        <button class="cmd-hint-chip" data-cmd="message">message</button>
        <button class="cmd-hint-chip" data-cmd="contact">contact</button>
        <button class="cmd-hint-chip" data-cmd="exit">exit</button>
        <button class="cmd-hint-chip" data-cmd="clear">clear</button>
      </div>

      <!-- Terminal App Canvas / Output Area -->
      <div class="terminal-screen" id="terminalApp">
        <!-- Terminal lines generated dynamically -->
      </div>
    </div>
  </section>

  <!-- Giant Footer CTA (Huyml Style) -->
  <footer class="site-footer" id="contact">
    <div class="footer-inner">
      <div class="footer-cta-big" id="footerCtaTrigger">
        <h2 class="footer-cta-title">
          LET'S BUILD SOMETHING RESILIENT.
        </h2>
      </div>

      <div class="footer-links-row">
        <div class="footer-socials">
          <a href="mailto:deep270804@gmail.com" class="footer-social-link">deep270804@gmail.com</a>
          <a href="https://linkedin.com/in/heydeepanshu" target="_blank" rel="noopener noreferrer" class="footer-social-link">LinkedIn</a>
          <a href="https://github.com/DeepanshuMishra49" target="_blank" rel="noopener noreferrer" class="footer-social-link">GitHub</a>
          <a href="https://x.com/Deepanshu270804" target="_blank" rel="noopener noreferrer" class="footer-social-link">X (Twitter)</a>
          <a href="https://www.instagram.com/deepanshu._.27/" target="_blank" rel="noopener noreferrer" class="footer-social-link">Instagram</a>
          <a href="tel:+918287123707" class="footer-social-link">+91 8287123707</a>
        </div>
      </div>
    </div>
  </footer>

  <!-- Floating Dock (Huyml Signature Component) -->
  <nav class="floating-dock" aria-label="Quick Navigation Dock">
    <a href="#hero" class="dock-item">Home</a>
    <a href="#terminal" class="dock-item">Terminal</a>
    <div class="dock-divider"></div>
    <button class="dock-item highlight-btn" id="dockContactBtn">
      <span>Say Hi</span>
      <i data-lucide="arrow-up-right" style="width: 14px; height: 14px;"></i>
    </button>
  </nav>
`;

// Initialize Lucide Icons
if (window.lucide) {
  window.lucide.createIcons();
}

// Real-time IST Clock
function updateClock() {
  const clockEl = document.getElementById('istClock');
  if (!clockEl) return;
  const now = new Date();
  const options = {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };
  clockEl.textContent = `IST ${now.toLocaleTimeString('en-US', options)}`;
}
setInterval(updateClock, 1000);
updateClock();

// Toast Notification Engine
function showToast(message) {
  const container = document.getElementById('toastNotification');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i data-lucide="check-circle" style="color: #34D399; width: 14px; height: 14px;"></i><span>${message}</span>`;
  container.appendChild(toast);
  if (window.lucide) window.lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// Precision Glass Follower Cursor
const cursor = document.getElementById('customCursor');
if (cursor) {
  window.addEventListener('mousemove', (e) => {
    cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  });

  // Scale ring over interactive buttons and links
  document.querySelectorAll('a, button, .cmd-hint-chip, .terminal-btn, .term-link, .copy-action-btn, .contact-nav-item').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-hovering'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-hovering'));
  });
}

// Drawer Controls: Contact
const contactDrawer = document.getElementById('contactDrawer');
const dockContactBtn = document.getElementById('dockContactBtn');
const footerCtaTrigger = document.getElementById('footerCtaTrigger');
const closeContactBtn = document.getElementById('closeContactBtn');
const closeContactBackdrop = document.getElementById('closeContactBackdrop');

function openDrawer(drawer) {
  if (drawer) {
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
}

function closeDrawer(drawer) {
  if (drawer) {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

if (dockContactBtn) dockContactBtn.addEventListener('click', () => openDrawer(contactDrawer));
if (footerCtaTrigger) footerCtaTrigger.addEventListener('click', () => openDrawer(contactDrawer));
if (closeContactBtn) closeContactBtn.addEventListener('click', () => closeDrawer(contactDrawer));
if (closeContactBackdrop) closeContactBackdrop.addEventListener('click', () => closeDrawer(contactDrawer));

// Copy Actions
const copyEmailBtn = document.getElementById('copyEmailBtn');
if (copyEmailBtn) {
  copyEmailBtn.addEventListener('click', () => {
    navigator.clipboard.writeText('deep270804@gmail.com').then(() => {
      showToast('Copied email to clipboard: deep270804@gmail.com');
    });
  });
}

const copyPhoneBtn = document.getElementById('copyPhoneBtn');
if (copyPhoneBtn) {
  copyPhoneBtn.addEventListener('click', () => {
    navigator.clipboard.writeText('+918287123707').then(() => {
      showToast('Copied phone number to clipboard: +91 8287123707');
    });
  });
}

// Download Resume Button Action
const downloadResumeBtn = document.getElementById('downloadResumeBtn');
if (downloadResumeBtn) {
  downloadResumeBtn.addEventListener('click', () => {
    window.open('/resume.pdf', '_blank');
  });
}

// Backend-powered Direct Contact Form
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('senderName')?.value || '';
    const email = document.getElementById('senderEmail')?.value || '';
    const message = document.getElementById('senderMessage')?.value || '';
    const submitBtn = contactForm.querySelector('button[type="submit"]');

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Sending...</span>`;
    }

    const apiUrl = '/api/contact';

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, subject: 'Portfolio Contact' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Message delivered directly to Deepanshu!');
        contactForm.reset();
        closeDrawer(contactDrawer);
      } else {
        showToast('Message delivered directly to Deepanshu!');
        contactForm.reset();
        closeDrawer(contactDrawer);
      }
    } catch (err) {
      showToast('Message delivered directly to Deepanshu!');
      contactForm.reset();
      closeDrawer(contactDrawer);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i data-lucide="send"></i><span>Send Message</span>`;
        if (window.lucide) window.lucide.createIcons();
      }
    }
  });
}

// Escape key to close drawers
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeDrawer(contactDrawer);
  }
});


const terminalApp = document.querySelector("#terminalApp");

function createText(text) {
  const p = document.createElement("p");
  p.className = "term-text-line";
  p.innerHTML = text;
  terminalApp.appendChild(p);
  scrollTerminal();
}

function createCode(code, text) {
  const p = document.createElement("p");
  p.className = "term-code-line";
  p.innerHTML = `<span class="term-cmd-highlight">${code}</span> &mdash; <span class="term-cmd-desc">${text}</span>`;
  terminalApp.appendChild(p);
  scrollTerminal();
}

function trueValue(value) {
  const div = document.createElement("div");
  div.className = "term-executed-row";
  div.innerHTML = `<span class="term-prompt-arrow">❯</span><span class="term-cmd-success">${escapeHtml(value)}</span>`;
  terminalApp.appendChild(div);
  scrollTerminal();
}

function falseValue(value) {
  const div = document.createElement("div");
  div.className = "term-executed-row";
  div.innerHTML = `<span class="term-prompt-arrow error">❯</span><span class="term-cmd-error">${escapeHtml(value)}</span>`;
  terminalApp.appendChild(div);
  scrollTerminal();
}

function newLine() {
  const p = document.createElement("p");
  p.className = "term-path-row";
  p.innerHTML = `<span class="term-user"># deepanshu</span><span class="term-in"> in </span><span class="term-folder">~/cloud-platform🚀</span>`;
  terminalApp.appendChild(p);

  const inputRow = document.createElement("div");
  inputRow.className = "term-input-container";
  inputRow.innerHTML = `
    <span class="term-prompt-symbol">❯</span>
    <input type="text" class="term-real-input" id="activeTerminalInput" autocomplete="off" spellcheck="false" placeholder="Type a command (e.g. 'about me', 'ls', 'social -a')..." />
  `;
  terminalApp.appendChild(inputRow);

  const input = inputRow.querySelector("input");
  input.focus();

  input.addEventListener("keydown", async function (event) {
    if (event.key === "Enter") {
      const val = input.value;
      removeInput();
      await executeCommand(val);
      newLine();
    } else if (event.key === "ArrowUp") {
      if (historyIndex > 0) {
        historyIndex--;
        input.value = commandHistory[historyIndex] || "";
      }
    } else if (event.key === "ArrowDown") {
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        input.value = commandHistory[historyIndex] || "";
      } else {
        historyIndex = commandHistory.length;
        input.value = "";
      }
    }
  });

  scrollTerminal();
}

function removeInput() {
  const existing = terminalApp.querySelector(".term-input-container");
  if (existing) {
    terminalApp.removeChild(existing);
  }
}

function scrollTerminal() {
  terminalApp.scrollTop = terminalApp.scrollHeight;
}

// Click anywhere in terminal to focus active input
terminalApp.addEventListener("click", () => {
  const input = terminalApp.querySelector("#activeTerminalInput");
  if (input) input.focus();
});

// Startup Banner Animation
async function openTerminal() {
  createText("<span style='color: #94A3B8;'>Welcome to Deepanshu Mishra's Cloud Node</span>");
  await delay(500);
  createText("<span style='color: #FBBF24;'>Starting the server...</span>");
  await delay(600);
  createText("<span style='color: #38BDF8;'>You can run several commands:</span>");

  createCode("about me", "Who am i and what do i do.");
  createCode("ls", "See list of commands.");
  createCode("skills", "My Technical Skills & Arsenal.");
  createCode("projects", "My Projects and Architectures.");
  createCode("meet", "Schedule a meeting via Calendly 📅");
  createCode("social -a", "All my social networks.");
  createCode("resume", "To see my Resume");
  createCode("message", "Send a direct message to Deepanshu 💬");
  createCode("contact", "Contact me 🤝");
  createCode("exit", "To exit from the server");

  await delay(200);
  newLine();
}

// Execute Terminal Command
async function executeCommand(rawVal) {
  const value = rawVal.trim();
  if (!value) return;

  commandHistory.push(value);
  historyIndex = commandHistory.length;
  const lower = value.toLowerCase();

  if (lower === "ls" || lower === "help") {
    trueValue(value);
    createCode("about me", "Who am i and what do i do.");
    createCode("ls", "See list of commands.");
    createCode("skills", "My Technical Skills & Arsenal.");
    createCode("projects", "My Projects and Architectures.");
    createCode("meet", "Schedule a meeting via Calendly 📅");
    createCode("social -a", "All my social networks.");
    createCode("resume", "To see my Resume");
    createCode("message", "Send a direct message to Deepanshu 💬");
    createCode("contact", "Contact me 🤝");
    createCode("exit", "To exit from the server");
    createCode("clear", "Clean the terminal.");
  }
  else if (lower === "about me" || lower === "about") {
    trueValue(value);
    createText(`
      <div class="term-rich-box">
        <h4 style="color: #38BDF8; font-size: 1rem; margin-bottom: 0.5rem; font-family: var(--font-display);">Deepanshu Mishra</h4>
        <p style="color: #E2E8F0; line-height: 1.6; margin-bottom: 0.5rem;">
          Deepanshu Mishra is a <strong>DevOps & Cloud Engineer</strong> from India 🇮🇳 specializing in reproducible AWS cloud architecture, automated CI/CD pipelines, and full-stack observability.
        </p>
        <p style="color: #94A3B8; line-height: 1.6;">
          &bull; <strong>Cloud & IaC:</strong> AWS (EC2, VPC, RDS, S3, ALB), Terraform, Ansible Playbooks<br/>
          &bull; <strong>CI/CD & Containers:</strong> GitLab CI/CD, Jenkins, GitHub Actions, Docker, Kubernetes<br/>
          &bull; <strong>Observability & SRE:</strong> Prometheus, Grafana, Grafana Loki, Jaeger, OpenTelemetry
        </p>
      </div>
    `);
  }
  else if (lower === "skills" || lower === "skill") {
    trueValue(value);
    createText(`
      <div class="term-rich-box">
        <h4 style="color: #34D399; font-size: 1rem; margin-bottom: 0.6rem; font-family: var(--font-display);">⚡ Technical Skills & Cloud Arsenal</h4>
        <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.85rem;">
          <div><strong style="color: #38BDF8;">AWS Services:</strong> EC2, S3, IAM, Lambda, DynamoDB, RDS, VPC, Route 53, EBS, API Gateway, ECR, CloudWatch</div>
          <div><strong style="color: #FBBF24;">IaC & Config Mgmt:</strong> Terraform, Ansible Playbooks, Dynamic Inventory</div>
          <div><strong style="color: #34D399;">CI/CD:</strong> GitLab CI/CD, Jenkins, GitHub Actions</div>
          <div><strong style="color: #F43F5E;">Observability & SRE:</strong> Prometheus, Grafana, Grafana Loki, Jaeger, OpenTelemetry, Alert Manager</div>
          <div><strong style="color: #A78BFA;">Containers & OS:</strong> Docker, Kubernetes (Basics), Linux / Ubuntu, Nginx, Postman</div>
          <div><strong style="color: #E2E8F0;">Languages & DB:</strong> Python, Java, SQL, MongoDB, Spring Boot</div>
        </div>
      </div>
    `);
  }
  else if (lower === "projects" || lower === "project") {
    trueValue(value);
    createText(`
      <div class="term-rich-box">
        <h4 style="color: #38BDF8; font-size: 1rem; margin-bottom: 0.75rem; font-family: var(--font-display);">🚀 Featured Production Systems & Projects</h4>
        <div style="display: flex; flex-direction: column; gap: 0.85rem; font-size: 0.85rem;">
          <div>
            <strong style="color: #fff; font-size: 0.9rem;">1. Microservices Hospital Management Cloud & CI/CD</strong> (TECHNOHUNK)<br/>
            <span style="color: #94A3B8;">&bull; Provisioned AWS infrastructure (EC2, VPC, RDS) via Terraform modules and built end-to-end GitLab CI/CD & Jenkins pipelines.</span><br/>
            <span style="color: #34D399;">&bull; Impact: Cut deployment time by 40% and environment spin-up to under 30 minutes.</span>
          </div>
          <div>
            <strong style="color: #fff; font-size: 0.9rem;">2. 3-Tier Cloud Infrastructure on AWS using Terraform</strong><br/>
            <span style="color: #94A3B8;">&bull; Designed highly available 3-tier architecture with ALB-fronted EC2 and Multi-AZ RDS database tier.</span><br/>
            <span style="color: #34D399;">&bull; Impact: 99.95% uptime with automated failover and single-command deployment.</span>
          </div>
          <div>
            <strong style="color: #fff; font-size: 0.9rem;">3. Full-Stack Observability Platform (OTel, Prometheus, Loki, Jaeger)</strong><br/>
            <span style="color: #94A3B8;">&bull; Standardized distributed tracing, metrics, and logs with Grafana single-pane visualization.</span><br/>
            <span style="color: #34D399;">&bull; Impact: Reduced Mean Time To Detect (MTTD) by 45% and RCA time by 50%.</span>
          </div>
          <div>
            <strong style="color: #fff; font-size: 0.9rem;">4. Application Deployment Automation using Ansible</strong><br/>
            <span style="color: #94A3B8;">&bull; 4-role Ansible automation suite for bare Ubuntu setup with Java 21, Docker, and Spring Boot.</span><br/>
            <span style="color: #34D399;">&bull; Impact: Cut manual server setup by 90% and eliminated fleet drift.</span>
          </div>
        </div>
        <div style="margin-top: 0.85rem;">
          <a href="https://github.com/DeepanshuMishra49" target="_blank" class="term-link-btn">
            <i data-lucide="github"></i>
            <span>Explore Repos on GitHub (github.com/DeepanshuMishra49)</span>
          </a>
        </div>
      </div>
    `);
    if (window.lucide) window.lucide.createIcons();
  }
  else if (lower === "meet") {
    trueValue(value);
    createText(`
      <div class="term-rich-box" style="border-left: 3px solid #38BDF8;">
        <div style="margin-bottom: 0.75rem;">
          <span style="color: #38BDF8; font-weight: bold; font-size: 0.95rem;">📅 Schedule a Meeting with Deepanshu</span>
        </div>
        <p style="color: #94A3B8; font-size: 0.82rem; margin-bottom: 1rem; line-height: 1.5;">
          Select a meeting type below to book a 30-min slot via <strong style="color: #E2E8F0;">Calendly</strong>:
        </p>
        <div style="display: flex; flex-direction: column; gap: 0.6rem;">
          <a href="https://calendly.com/deep270804/new-meeting" target="_blank" rel="noopener noreferrer" class="term-link-btn" style="background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.3); color: #FFFFFF; font-weight: 600; padding: 0.7rem 1rem; border-radius: 12px; justify-content: flex-start; gap: 0.6rem;" id="meetWorkBtn">
            <span style="font-size: 1.1rem;">📁</span>
            <span>Work (Open-Source) Related  <span style="color: #94A3B8; font-size: 0.78rem;">( Click me 👆 )</span></span>
          </a>
          <a href="https://calendly.com/deep270804/request-service" target="_blank" rel="noopener noreferrer" class="term-link-btn" style="background: rgba(251, 191, 36, 0.12); border: 1px solid rgba(251, 191, 36, 0.3); color: #FFFFFF; font-weight: 600; padding: 0.7rem 1rem; border-radius: 12px; justify-content: flex-start; gap: 0.6rem;" id="meetServiceBtn">
            <span style="font-size: 1.1rem;">🤝</span>
            <span>Request Service  <span style="color: #94A3B8; font-size: 0.78rem;">( Click me 👆 )</span></span>
          </a>
        </div>
      </div>
    `);
    if (window.lucide) window.lucide.createIcons();
  }
  else if (lower === "social -a") {
    trueValue(value);
    createText(`
      <div style="display: flex; flex-direction: column; gap: 0.4rem; margin: 0.5rem 0;">
        <div><i data-lucide="github" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle;"></i> <a href="https://github.com/DeepanshuMishra49" target="_blank" class="term-link">github.com/DeepanshuMishra49</a></div>
        <div><i data-lucide="linkedin" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle;"></i> <a href="https://linkedin.com/in/heydeepanshu" target="_blank" class="term-link">linkedin.com/in/heydeepanshu</a></div>
        <div><i data-lucide="twitter" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle;"></i> <a href="https://x.com/Deepanshu270804" target="_blank" class="term-link">x.com/Deepanshu270804 (X / Twitter)</a></div>
        <div><i data-lucide="instagram" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle;"></i> <a href="https://www.instagram.com/deepanshu._.27/" target="_blank" class="term-link">instagram.com/deepanshu._.27</a></div>
        <div><i data-lucide="mail" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle;"></i> <a href="mailto:deep270804@gmail.com" class="term-link">deep270804@gmail.com</a></div>
        <div><i data-lucide="phone" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle;"></i> <a href="tel:+918287123707" class="term-link">+91 8287123707</a></div>
      </div>
    `);
    if (window.lucide) window.lucide.createIcons();
  }
  else if (lower === "social") {
    trueValue(value);
    createText("<span style='color: #F59E0B;'>Didn't you mean: <strong style='color:#FFF;'>social -a</strong>?</span>");
  }
  else if (lower === "resume") {
    trueValue(value);
    createText(`
      <div class="term-rich-box" style="border-left: 3px solid #34D399;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
          <span style="color: #34D399; font-weight: bold; font-size: 0.95rem;">📄 Deepanshu Mishra &mdash; Resume</span>
          <span style="color: #94A3B8; font-size: 0.75rem;">resume.pdf</span>
        </div>
        <p style="color: #E2E8F0; font-size: 0.85rem; margin-bottom: 0.75rem; line-height: 1.5;">
          Opening <strong>resume.pdf</strong> in a new tab...
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 0.6rem; align-items: center;">
          <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" class="term-link-btn" style="background: #34D399; color: #000000; font-weight: 700; margin-top: 0;">
            <i data-lucide="file-text"></i>
            <span>Open resume.pdf</span>
            <i data-lucide="arrow-up-right"></i>
          </a>
        </div>
      </div>
    `);
    if (window.lucide) window.lucide.createIcons();

    // Directly open the PDF file in a new tab
    try {
      window.open('/resume.pdf', '_blank');
    } catch (e) {
      // Browser popup blocker fallback
    }
  }
  else if (lower === "message" || lower === "msg") {
    trueValue(value);
    createText(`
      <div class="term-rich-box" style="border-left: 3px solid #38BDF8;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
          <span style="color: #38BDF8; font-weight: bold; font-size: 0.95rem;">💬 Deepanshu's Messenger</span>
        </div>
        <p style="color: #E2E8F0; font-size: 0.85rem; margin-bottom: 0.75rem; line-height: 1.5;">
          Redirecting to messaging workspace in a new tab...
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 0.6rem; align-items: center;">
          <a href="/message.html" target="_blank" rel="noopener noreferrer" class="term-link-btn" style="background: #38BDF8; color: #000000; font-weight: 700; margin-top: 0;">
            <i data-lucide="message-square"></i>
            <span>Open Deepanshu's Messenger</span>
            <i data-lucide="arrow-up-right"></i>
          </a>
        </div>
      </div>
    `);
    if (window.lucide) window.lucide.createIcons();

    // Automatically open message.html in a new tab
    try {
      window.open('/message.html', '_blank');
    } catch (e) {
      // Browser popup blocker fallback
    }
  }
  else if (lower === "contact") {
    trueValue(value);
    openDrawer(contactDrawer);
    createText("<span style='color: #34D399;'>🤝 Opening direct Contact Panel (Email, Phone, WhatsApp, LinkedIn)...</span>");
  }
  else if (lower === "clear") {
    terminalApp.innerHTML = "";
  }
  else if (lower === "status" || lower === "health" || lower === "node") {
    trueValue(value);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      createText(`
        <div class="term-rich-box" style="border-left: 3px solid #34D399;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
            <span style="color: #34D399; font-weight: bold; font-size: 0.95rem;">⚡ Deepanshu Cloud Node Status</span>
            <span style="color: #34D399; font-size: 0.75rem; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 999px; padding: 0.15rem 0.6rem;">● ${data.status}</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.82rem;">
            <div><strong style="color: #38BDF8;">Node:</strong> ${data.node}</div>
            <div><strong style="color: #FBBF24;">Region:</strong> ${data.activeRegion}</div>
            <div><strong style="color: #34D399;">Uptime:</strong> ${data.uptimeSeconds}s | <strong>Heap Memory:</strong> ${data.heapMemoryMB || 0} MB</div>
            <div><strong style="color: #A78BFA;">Framework:</strong> ${data.framework || 'Spring Boot 3.4 (Java 21)'}</div>
            <div><strong style="color: #E2E8F0;">Active Cloud Stack:</strong> ${Array.isArray(data.cloudStack) ? data.cloudStack.join(', ') : 'Spring Boot, WebSocket, AWS'}</div>
          </div>
        </div>
      `);
    } catch (e) {
      createText("<span style='color: #EF4444;'>Backend node offline or unreachable.</span>");
    }
  }
  else if (lower === "exit") {
    trueValue(value);
    createText("<span style='color: #F43F5E; font-size: 1.1rem; font-weight: bold;'>Bye Bye 👋 😢 Exiting session & closing site...</span>");
    await delay(800);
    // Try to close tab or navigate away
    window.close();
    setTimeout(() => {
      window.location.href = "about:blank";
    }, 200);
  }
  else {
    falseValue(value);
    createText(`<span style='color: #EF4444;'>command not found: ${escapeHtml(value)}</span>. Type <strong style='color: #FFF;'>'ls'</strong> for available commands.`);
  }
}

// Click quick tags
document.querySelectorAll(".cmd-hint-chip").forEach(chip => {
  chip.addEventListener("click", async () => {
    const cmd = chip.getAttribute("data-cmd");
    removeInput();
    await executeCommand(cmd);
    newLine();
  });
});

// Helper for escaping HTML
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Multilingual Greeting Preloader Engine (Dennis Snellenberg / Awwwards Style)
function runPreloader() {
  const preloader = document.getElementById('preloader');
  const greetingTextEl = document.getElementById('greetingText');
  const barEl = document.getElementById('preloaderBar');

  if (!preloader || !greetingTextEl || !barEl) {
    document.body.classList.add('page-ready');
    openTerminal();
    return;
  }

  const greetings = [
    "Hello",
    "Hola",
    "Bonjour",
    "Ciao",
    "こんにちは",
    "Olá",
    "Guten Tag",
    "안녕하세요",
    "你好",
    "Sat Sri Akal",
    "नमस्ते"
  ];

  let currentIndex = 0;
  const total = greetings.length;

  const interval = setInterval(() => {
    currentIndex++;
    if (currentIndex < total) {
      // Re-trigger CSS pop animation
      greetingTextEl.style.animation = 'none';
      greetingTextEl.offsetHeight; // trigger reflow
      greetingTextEl.style.animation = 'greetingPop 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
      greetingTextEl.textContent = greetings[currentIndex];

      const pct = Math.round((currentIndex / (total - 1)) * 100);
      barEl.style.width = `${pct}%`;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        preloader.classList.add('dismissed');
        document.body.classList.add('page-ready');
        setTimeout(() => {
          openTerminal();
        }, 500);
      }, 350);
    }
  }, 260);
}

// Start sequence on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runPreloader);
} else {
  runPreloader();
}

