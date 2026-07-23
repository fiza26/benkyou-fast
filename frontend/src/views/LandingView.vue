<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import supabase from '@/supabase'

const router = useRouter()
const localUser = ref(null)

// FAQ Toggle Logic
const activeFaq = ref(null)
const faqs = [
    {
        q: "How does the acquisition method work?",
        a: "We focus on high-frequency vocabulary. By using a 'one-by-one' approach and smart relearning cycles, we ensure words move from short-term to long-term memory."
    },
    {
        q: "Is there a daily limit?",
        a: "No! You can learn at your own pace, but we recommend keeping your daily streak alive to maximize consistency."
    },
    {
        q: "Can I track my ranking?",
        a: "Yes! Every word you master earns you points. You can see how you stack up against other learners on the global leaderboard."
    }
]

async function isLoggedIn() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
        localUser.value = session
    }
}

onMounted(isLoggedIn)

const startLearning = () => {
    if (localUser.value) {
        router.push({ name: 'home' })
    } else {
        router.push({ name: 'login' })
    }
}

// Navbar Scroll Helper
const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}
</script>

<template>
    <main>
        <nav class="landing-nav">
            <div class="nav-inner">
                <div class="logo">
                    <Icon icon="fluent-emoji:books" />
                    <span>Benkyou Fast</span>
                </div>
                <div class="nav-links">
                    <span @click="scrollTo('features')">Features</span>
                    <span @click="scrollTo('leaderboard')">Ranking</span>
                    <span @click="scrollTo('faq')">FAQ</span>
                    <button class="nav-cta" @click="startLearning">Start Now</button>
                </div>
            </div>
        </nav>

        <section class="hero" id="hero">
            <div class="hero-inner">
                <div class="hero-content">
                    <h1>Benkyou <span class="jp-text">勉強</span></h1>
                    <h2>Master Vocabulary <br> <span class="highlight">One Day at a Time.</span></h2>
                    <p>Stop forgetting. Start acquiring. Benkyou Fast uses daily streaks and science-backed acquisition
                        to
                        help you master Japanese words effectively.</p>

                    <div class="cta-group">
                        <button class="cta-button primary" @click="startLearning">
                            {{ localUser ? 'Continue Journey' : 'Get Started for Free' }}
                            <Icon icon="mingcute:arrow-right-line" />
                        </button>
                    </div>
                </div>

                <div class="hero-visual">
                    <div class="visual-container">
                        <div class="app-card">
                            <!-- <div class="app-header">
                                <div class="pulse-container">
                                    <span class="pulse-dot"></span>
                                    <span class="pulse-text">Live Session</span>
                                </div>
                                <Icon icon="solar:menu-dots-bold" class="menu-icon" />
                            </div> -->

                            <div class="flashcard">
                                <div class="card-tag">New Word</div>
                                <h3 class="kanji">勉強</h3>
                                <p class="romaji">Benkyou</p>
                                <p class="meaning">Study / Learning</p>
                            </div>

                            <div class="progress-section">
                                <div class="progress-text">
                                    <span>Daily Goal</span>
                                    <strong>8/10 Words</strong>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill"></div>
                                </div>
                            </div>
                        </div>

                        <div class="floating-badge streak-badge float-delay-1">
                            <div class="icon-wrapper">
                                <Icon icon="fluent-emoji:fire" width="28" />
                            </div>
                            <div class="badge-info">
                                <strong>14 Days</strong>
                                <span>Streak Hero!</span>
                            </div>
                        </div>

                        <div class="floating-badge points-badge float-delay-2">
                            <div class="icon-wrapper blue-bg">
                                <Icon icon="fluent-emoji:star" width="28" />
                            </div>
                            <div class="badge-info">
                                <strong>+50 XP</strong>
                                <span>Words Mastered</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="app-features" id="features">
            <div class="section-title">
                <h3>Your Learning Path</h3>
            </div>
            <div class="features-grid">
                <div class="feature-item">
                    <div class="icon-box red">
                        <Icon icon="fluent-emoji:rocket" width="40" />
                    </div>
                    <h4>Step-by-Step</h4>
                    <p>Learn new Japanese words one by one. Focused, high-frequency vocabulary acquisition.</p>
                </div>

                <div class="feature-item">
                    <div class="icon-box blue">
                        <Icon icon="fluent-emoji:card-index-dividers" width="40" />
                    </div>
                    <h4>Smart Review</h4>
                    <p>Relearn everything you've mastered. Keep your memory sharp and words fresh.</p>
                </div>

                <div class="feature-item">
                    <div class="icon-box purple">
                        <Icon icon="fluent-emoji:brain" width="40" />
                    </div>
                    <h4>Advanced Modes</h4>
                    <p>Push your limits with advanced acquisition learning for fluent word recognition.</p>
                </div>
            </div>
        </section>

        <section class="leaderboard-preview" id="leaderboard">
            <div class="preview-card">
                <div class="header">
                    <Icon icon="iconoir:leaderboard-star" width="30" />
                    <h3>Top Learners This Week</h3>
                </div>
                <div class="preview-list">
                    <div class="list-item"><span>🥇 Tanaka_Sensei</span> <span>4,850 pts</span></div>
                    <div class="list-item"><span>🥈 Yuki_Learn</span> <span>3,210 pts</span></div>
                    <div class="list-item"><span>🥉 Kenji_99</span> <span>2,100 pts</span></div>
                </div>
                <p class="preview-footer">Join the race to the top of the leaderboard!</p>
            </div>
        </section>

        <section class="stats-banner">
            <div class="stats-container">
                <div class="stat-item">
                    <span class="num">{{ localUser ? '🔥' : '0' }}</span>
                    <p>Day Streak</p>
                </div>
                <div class="divider"></div>
                <div class="stat-item">
                    <span class="num">100%</span>
                    <p>Acquisition</p>
                </div>
                <div class="divider"></div>
                <div class="stat-item">
                    <span class="num">#1</span>
                    <p>Leaderboard</p>
                </div>
            </div>
        </section>

        <section class="faq" id="faq">
            <h3>Common Questions</h3>
            <div class="faq-list">
                <div v-for="(item, index) in faqs" :key="index" class="faq-item"
                    @click="activeFaq = activeFaq === index ? null : index">
                    <div class="question" :class="{ 'active-q': activeFaq === index }">
                        {{ item.q }}
                        <Icon class="chevron"
                            :icon="activeFaq === index ? 'iconamoon:arrow-up-2-light' : 'iconamoon:arrow-down-2-light'" />
                    </div>
                    <transition name="faq-slide">
                        <div class="answer" v-show="activeFaq === index">
                            <p>{{ item.a }}</p>
                        </div>
                    </transition>
                </div>
            </div>
        </section>

        <section class="final-cta">
            <h2>Ready to master Japanese?</h2>
            <p>Start your streak today and join our community of learners.</p>
            <button class="cta-button primary" @click="startLearning">Get Started Now</button>
        </section>

        <footer>
            <div class="footer-logo">
                <Icon icon="fluent-emoji:books" />
                <span>Benkyou Fast</span>
            </div>
            <p>&copy; 2026 • Built for Japanese Learners • Ganbatte Kudasai!</p>
        </footer>
    </main>
</template>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;800&display=swap');

$primary-gradient: linear-gradient(90deg, #00d2ff 0%, #3a47d5 100%);
$text-dark: #2c3e50;

main {
    background-color: #fcfcfc;
    color: $text-dark;
    font-family: "Poppins", sans-serif;
}

// NAVBAR
.landing-nav {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 70px;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    z-index: 1000;
    display: flex;
    justify-content: center;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);

    .nav-inner {
        width: 90%;
        max-width: 1200px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .logo {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 800;
        font-size: 1.2rem;
        color: #3a47d5;
    }

    .nav-links {
        display: flex;
        align-items: center;
        gap: 30px;

        span {
            cursor: pointer;
            font-weight: 600;
            font-size: 0.9rem;
            transition: 0.2s;

            &:hover {
                color: #00d2ff;
            }
        }
    }

    .nav-cta {
        font-family: 'Poppins', sans-serif;
        background: $text-dark;
        color: white;
        border: none;
        padding: 8px 20px;
        border-radius: 10px;
        font-weight: 600;
        cursor: pointer;
        transition: 0.2s;

        &:hover {
            transform: scale(1.05);
            background: #3a47d5;
        }
    }
}

// HERO
.hero {
    padding: 160px 5% 80px;
    background-image: url("@/assets/doodle-art.jpg");
    background-size: cover;
    background-position: center;
    position: relative;
    overflow: hidden;

    &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.93);
        z-index: 1;
    }

    .hero-inner {
        position: relative;
        z-index: 2;
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        gap: 60px;
        flex-wrap: wrap;
    }
}

.hero-content {
    flex: 1;
    min-width: 320px;

    .badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: #e8f0fe;
        color: #3a47d5;
        padding: 8px 18px;
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: 600;
        margin-bottom: 25px;
    }

    h1 {
        font-size: 1.6rem;
        font-weight: 400;
        color: #7f8c8d;

        .jp-text {
            color: #3a47d5;
            font-weight: 800;
        }
    }

    h2 {
        font-size: 3.5rem;
        line-height: 1.1;
        margin: 10px 0 25px;

        .highlight {
            background: $primary-gradient;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
    }

    p {
        font-size: 1.15rem;
        color: #5d6d7e;
        margin-bottom: 40px;
        max-width: 520px;
        line-height: 1.7;
    }
}

.cta-button {
    font-family: 'Poppins', sans-serif;
    padding: 18px 36px;
    border-radius: 15px;
    border: none;
    font-weight: 600;
    font-size: 1.1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

    &.primary {
        background: $primary-gradient;
        color: white;
        box-shadow: 0 10px 25px rgba(58, 71, 213, 0.3);

        &:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 30px rgba(58, 71, 213, 0.4);
        }
    }
}

// REDESIGNED HERO VISUAL STYLES
.hero-visual {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;

    .visual-container {
        position: relative;
        width: 100%;
        max-width: 400px;
    }

    .app-card {
        background: #ffffff;
        border-radius: 32px;
        box-shadow: 0 30px 60px rgba(0, 0, 0, 0.08),
            0 0 0 1px rgba(0, 0, 0, 0.02);
        padding: 30px;
        display: flex;
        flex-direction: column;
        position: relative;
        z-index: 2;
    }

    .app-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;

        .pulse-container {
            display: flex;
            align-items: center;
            gap: 8px;
            background: #f0fdf4;
            padding: 6px 14px;
            border-radius: 20px;

            .pulse-dot {
                width: 8px;
                height: 8px;
                background-color: #22c55e;
                border-radius: 50%;
                box-shadow: 0 0 0 rgba(34, 197, 94, 0.4);
                animation: pulse 2s infinite;
            }

            .pulse-text {
                font-size: 0.8rem;
                font-weight: 600;
                color: #166534;
            }
        }

        .menu-icon {
            color: #94a3b8;
            font-size: 1.5rem;
            cursor: pointer;
        }
    }

    .flashcard {
        background: #f8fafc;
        border: 2px dashed #e2e8f0;
        border-radius: 24px;
        padding: 40px 20px;
        text-align: center;
        margin-bottom: 30px;
        position: relative;

        .card-tag {
            position: absolute;
            top: -12px;
            left: 50%;
            transform: translateX(-50%);
            background: $primary-gradient;
            color: white;
            font-size: 0.75rem;
            font-weight: 700;
            padding: 4px 12px;
            border-radius: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .kanji {
            font-size: 4rem;
            color: #1e293b;
            margin: 0 0 10px 0;
            line-height: 1;
        }

        .romaji {
            font-size: 1.1rem;
            color: #64748b;
            font-weight: 500;
            margin: 0 0 5px 0;
        }

        .meaning {
            font-size: 1.2rem;
            color: #3a47d5;
            font-weight: 700;
            margin: 0;
        }
    }

    .progress-section {
        .progress-text {
            display: flex;
            justify-content: space-between;
            font-size: 0.9rem;
            margin-bottom: 10px;
            color: #64748b;

            strong {
                color: #1e293b;
            }
        }

        .progress-bar {
            width: 100%;
            height: 10px;
            background: #f1f5f9;
            border-radius: 10px;
            overflow: hidden;

            .progress-fill {
                width: 80%;
                height: 100%;
                background: $primary-gradient;
                border-radius: 10px;
            }
        }
    }

    // Floating Badges
    .floating-badge {
        position: absolute;
        display: flex;
        align-items: center;
        gap: 12px;
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(12px);
        padding: 16px 20px;
        border-radius: 20px;
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.5);
        z-index: 3;
        animation: float 4s ease-in-out infinite;

        .icon-wrapper {
            background: #fff5f5;
            width: 48px;
            height: 48px;
            border-radius: 14px;
            display: flex;
            justify-content: center;
            align-items: center;

            &.blue-bg {
                background: #eff6ff;
            }
        }

        .badge-info {
            display: flex;
            flex-direction: column;

            strong {
                font-size: 1.1rem;
                color: #1e293b;
                line-height: 1.2;
            }

            span {
                font-size: 0.8rem;
                color: #64748b;
                font-weight: 500;
            }
        }
    }

    .streak-badge {
        top: -20px;
        right: -40px;
    }

    .points-badge {
        bottom: 30px;
        left: -50px;
    }

    // Animation Delays
    .float-delay-1 {
        animation-delay: 0s;
    }

    .float-delay-2 {
        animation-delay: 2s;
    }
}

// Animations
@keyframes pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
    }

    70% {
        box-shadow: 0 0 0 8px rgba(34, 197, 94, 0);
    }

    100% {
        box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
    }
}

@keyframes float {
    0% {
        transform: translateY(0px);
    }

    50% {
        transform: translateY(-12px);
    }

    100% {
        transform: translateY(0px);
    }
}

// FEATURES
.app-features {
    padding: 100px 5%;
    max-width: 1200px;
    margin: 0 auto;

    .section-title h3 {
        text-align: center;
        font-size: 2.2rem;
        margin-bottom: 60px;
        color: #2c3e50;
    }

    .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 30px;
    }

    .feature-item {
        background: white;
        padding: 45px;
        border-radius: 25px;
        border: 1px solid #f2f2f2;
        transition: 0.3s;

        &:hover {
            border-color: #00d2ff;
            transform: translateY(-8px);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.03);
        }

        .icon-box {
            width: 65px;
            height: 65px;
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 25px;

            &.red {
                background: #fee2e2;
                color: #ef4444;
            }

            &.blue {
                background: #e0f2fe;
                color: #0ea5e9;
            }

            &.purple {
                background: #f3e8ff;
                color: #a855f7;
            }
        }

        h4 {
            font-size: 1.4rem;
            margin-bottom: 12px;
        }

        p {
            color: #7f8c8d;
            line-height: 1.6;
        }
    }
}

// LEADERBOARD
.leaderboard-preview {
    padding: 60px 5%;
    display: flex;
    justify-content: center;

    .preview-card {
        background: white;
        padding: 35px;
        border-radius: 30px;
        width: 100%;
        max-width: 500px;
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.04);
        border: 1px solid #f0f0f0;

        .header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 25px;

            h3 {
                color: #3a47d5;
            }
        }

        .list-item {
            display: flex;
            justify-content: space-between;
            padding: 15px 0;
            border-bottom: 1px dashed #eee;
            font-weight: 600;
        }

        .preview-footer {
            text-align: center;
            color: #95a5a6;
            margin-top: 20px;
            font-size: 0.95rem;
        }
    }
}

// STATS
.stats-banner {
    padding: 80px 5%;

    .stats-container {
        max-width: 950px;
        margin: 0 auto;
        background: $primary-gradient;
        border-radius: 30px;
        padding: 50px;
        display: flex;
        justify-content: space-around;
        align-items: center;
        color: white;
        box-shadow: 15px 15px 50px -15px rgba(58, 71, 213, 0.4);

        .stat-item {
            text-align: center;

            .num {
                font-size: 3.5rem;
                font-weight: 800;
                display: block;
            }

            p {
                font-size: 1rem;
                opacity: 0.85;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
        }

        .divider {
            width: 1px;
            height: 60px;
            background: rgba(255, 255, 255, 0.3);
        }
    }
}

// FAQ + ANIMATION
.faq {
    padding: 100px 5%;
    max-width: 850px;
    margin: 0 auto;

    h3 {
        text-align: center;
        margin-bottom: 50px;
        font-size: 2.2rem;
    }

    .faq-item {
        background: white;
        margin-bottom: 18px;
        border-radius: 18px;
        cursor: pointer;
        border: 1px solid #f2f2f2;
        transition: 0.2s;

        &:hover {
            border-color: #3a47d5;
        }

        .question {
            padding: 22px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 600;

            &.active-q {
                color: #3a47d5;
            }
        }

        .answer {
            padding: 0 22px 22px;
            color: #7f8c8d;
            line-height: 1.7;
            overflow: hidden;
        }
    }
}

// Transition Logic for FAQ
.faq-slide-enter-active,
.faq-slide-leave-active {
    transition: all 0.3s ease-out;
    max-height: 200px;
}

.faq-slide-enter-from,
.faq-slide-leave-to {
    max-height: 0;
    opacity: 0;
    padding-bottom: 0;
}

// FINAL CTA
.final-cta {
    text-align: center;
    padding: 120px 5%;
    background-color: #f8fafb;

    h2 {
        font-size: 2.8rem;
        margin-bottom: 15px;
    }

    p {
        font-size: 1.2rem;
        color: #7f8c8d;
        margin-bottom: 40px;
    }

    .cta-button {
        margin: 0 auto;
    }
}

footer {
    padding: 70px;
    text-align: center;
    border-top: 1px solid #eee;

    .footer-logo {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        font-weight: 800;
        font-size: 1.3rem;
        color: #3a47d5;
        margin-bottom: 15px;
    }

    p {
        color: #bdc3c7;
        font-size: 0.9rem;
    }
}

@media (max-width: 768px) {
    .landing-nav .nav-links {
        display: none;
    }

    .hero {
        padding-top: 100px;
    }

    .hero-content h2 {
        font-size: 2.6rem;
    }

    .hero-visual {
        display: none;
    }

    .stats-container {
        flex-direction: column;
        gap: 40px;

        .divider {
            display: none;
        }
    }

    .final-cta h2 {
        font-size: 2.2rem;
    }
}
</style>