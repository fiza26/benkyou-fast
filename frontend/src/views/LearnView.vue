<script setup>
import { ref, watch, onMounted } from 'vue'
import axios from 'axios'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import confetti from 'canvas-confetti'
import supabase from '@/supabase'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
const router = useRouter()

// Logic & State
const learnedWords = ref([])
const vocabulary = ref([])
const wordLevel = ref(1)
const currentWord = ref(0)
const totalWordslearned = ref(0)
const modalState = ref(false)
const activeAchievement = ref(null)

const milestones = {
    50: { title: 'Wayfarer' },
    100: { title: 'Scholar' },
    300: { title: 'Sage' },
    1000: { title: 'Legend' }
}

onMounted(async () => {
    await userStore.getCurrentUser()
    if (userStore.name) {
        await getWordsLearned()
        await fetchWords()
        await getVocab()
    }
})

async function fetchWords() {
    const { data } = await supabase.from('words').select()
    if (data) learnedWords.value = data
}

const getVocab = async () => {
    try {
        const response = await axios.get(`https://jlpt-vocab-api.vercel.app/api/words/all?level=${wordLevel.value}`)
        if (response.data) {
            vocabulary.value = response.data.filter(word =>
                !learnedWords.value.some(learned => learned.word === word.word)
            )
        }
    } catch (error) {
        console.error('Error loading vocabulary:', error)
    }
}

const nextWord = async (word) => {
    await saveWord(word)
    await updateWordsLearned()
    await getWordsLearned()
    await userStore.updatePoints()

    if (currentWord.value < vocabulary.value.length - 1) {
        currentWord.value++
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 }, colors: ['#00d2ff', '#3a47d5'] })
    } else if (wordLevel.value === 5) {
        stop()
    } else {
        wordLevel.value++
        currentWord.value = 0
        await getVocab()
    }
}

async function saveWord(word) {
    await supabase.from('words').insert({
        word: word.word,
        meaning: word.meaning,
        furigana: word.furigana,
        romaji: word.romaji,
        level: word.level
    })
}

async function getWordsLearned() {
    const { data, error } = await supabase.from('users_data').select().eq('name', userStore.name)
    if (!error && data.length) totalWordslearned.value = data[0].words_learned
}

async function updateWordsLearned() {
    const { data, error: selectError } = await supabase
        .from('users_data').select('words_learned').eq('name', userStore.name).single()
    if (selectError) return
    const newCount = data.words_learned + 1
    await supabase.from('users_data').update({ words_learned: newCount }).eq('name', userStore.name)
}

watch(totalWordslearned, (newTotal) => {
    if (milestones[newTotal]) {
        activeAchievement.value = milestones[newTotal]
        triggerConfetti()
    }
})

const triggerConfetti = () => {
    const end = Date.now() + 2 * 1000
    const colors = ['#00d2ff', '#3a47d5', '#ffffff']
        ; (function frame() {
            confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors })
            confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors })
            if (Date.now() < end) requestAnimationFrame(frame)
        }())
}

const stop = () => { modalState.value = true }
const ok = () => { router.push('/') }
const closeAchievement = () => { activeAchievement.value = null }
</script>

<template>
    <main>
        <Transition name="modal-fade">
            <div class="modal-overlay" v-if="modalState">
                <div class="summary-card">
                    <Icon icon="solar:medal-ribbon-bold-duotone" class="summary-icon" />
                    <h1>Session Complete</h1>
                    <p>You mastered <strong>{{ currentWord }}</strong> new words today!</p>
                    <button class="primary-btn" @click="ok">Return Home</button>
                </div>
            </div>
        </Transition>

        <Transition name="modal-fade">
            <div class="modal-overlay" v-if="activeAchievement">
                <div class="achievement-card">
                    <div class="glow-ring"></div>
                    <div class="sparkles">✨</div>
                    <h3>NEW BADGE</h3>
                    <h2>{{ activeAchievement.title }}</h2>
                    <div class="badge-container">
                        <div class="badge-placeholder">
                            <Icon icon="solar:star-shine-bold-duotone" width="100" color="white" />
                        </div>
                    </div>
                    <p>Milestone: {{ totalWordslearned }} Words Learned</p>
                    <button class="white-btn" @click="closeAchievement">Incredible!</button>
                </div>
            </div>
        </Transition>

        <div class="container">
            <div class="learning-wrapper" v-if="!modalState">
                <div class="learning-card" v-if="vocabulary.length > 0">
                    <div class="progress-container">
                        <div class="progress-track">
                            <div class="progress-bar" :style="{ width: (currentWord / vocabulary.length * 100) + '%' }">
                            </div>
                        </div>
                        <span class="progress-text">
                            Level {{ wordLevel }} • {{ currentWord + 1 }}/{{ vocabulary.length }}
                        </span>
                    </div>

                    <div class="word-display">
                        <span class="furigana">{{ vocabulary[currentWord].furigana }}</span>
                        <h1 class="main-word">{{ vocabulary[currentWord].word }}</h1>
                        <span class="romaji">{{ vocabulary[currentWord].romaji }}</span>
                    </div>

                    <div class="divider"></div>

                    <div class="meaning-section">
                        <p class="label">Meaning</p>
                        <h2 class="meaning-text">{{ vocabulary[currentWord].meaning }}</h2>
                    </div>

                    <div class="button-group">
                        <button class="stop-btn" @click="stop" v-if="currentWord > 0">
                            <Icon icon="solar:stop-circle-bold" />
                        </button>
                        <button class="next-btn" @click="nextWord(vocabulary[currentWord])">
                            Got it!
                            <Icon icon="solar:alt-arrow-right-bold" />
                        </button>
                    </div>
                </div>

                <div v-else class="loading-container">
                    <Icon icon="line-md:loading-twotone-loop" class="loader" />
                    <p>Gathering fresh knowledge...</p>
                </div>
            </div>
        </div>
    </main>
</template>

<style lang="scss" scoped>
* {
    font-family: 'Poppins', sans-serif;
}

main {
    margin-top: 50px;
    background-color: #f8fafc;
    min-height: calc(100dvh - 80px);
    display: flex;
    flex-direction: column;
    font-family: 'Poppins', sans-serif;
}

.container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.learning-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.learning-card {
    background: white;
    width: 100%;
    max-width: 400px;
    /* Reduced for better focus */
    border-radius: 32px;
    padding: 32px;
    box-shadow: 0 20px 40px rgba(15, 23, 42, 0.06);
    border: 1px solid rgba(226, 232, 240, 0.8);

    .progress-container {
        margin-bottom: 25px;

        .progress-track {
            height: 8px;
            background: #f1f5f9;
            border-radius: 10px;
            overflow: hidden;

            .progress-bar {
                height: 100%;
                background: linear-gradient(90deg, #00d2ff, #3a47d5);
                transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
        }

        .progress-text {
            display: block;
            text-align: center;
            font-size: 0.7rem;
            font-weight: 700;
            color: #94a3b8;
            margin-top: 8px;
            text-transform: uppercase;
        }
    }
}

.word-display {
    text-align: center;

    .furigana {
        color: #94a3b8;
        font-size: 1rem;
        display: block;
        min-height: 1.2rem;
    }

    .main-word {
        font-size: 3.5rem;
        color: #0f172a;
        font-weight: 800;
        line-height: 1.2;
        margin: 5px 0;
    }

    .romaji {
        display: inline-block;
        color: #3a47d5;
        font-weight: 700;
        font-size: 0.9rem;
        background: #f0f4ff;
        padding: 4px 12px;
        border-radius: 100px;
    }
}

.divider {
    height: 1px;
    background: #f1f5f9;
    margin: 25px 0;
}

.meaning-section {
    text-align: center;

    .label {
        font-size: 0.65rem;
        text-transform: uppercase;
        color: #cbd5e1;
        letter-spacing: 1px;
        font-weight: 800;
    }

    .meaning-text {
        color: #334155;
        font-size: 1.4rem;
        font-weight: 700;
        margin-top: 4px;
    }
}

.button-group {
    display: flex;
    gap: 12px;
    margin-top: 30px;

    button {
        padding: 16px;
        border: none;
        border-radius: 18px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .next-btn {
        flex: 1;
        background: #1e293b;
        color: white;
        gap: 8px;

        &:hover {
            background: #0f172a;
            transform: translateY(-2px);
        }
    }

    .stop-btn {
        width: 55px;
        background: #f8fafc;
        color: #94a3b8;
        border: 1px solid #f1f5f9;

        &:hover {
            color: #ef4444;
            background: #fff1f2;
        }
    }
}

/* Modals & Summaries */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.8);
    backdrop-filter: blur(8px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.summary-card {
    background: white;
    padding: 40px;
    border-radius: 28px;
    text-align: center;
    max-width: 360px;
    width: 100%;
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.2);

    .summary-icon {
        font-size: 70px;
        color: #3a47d5;
        margin-bottom: 20px;
    }

    h1 {
        font-weight: 800;
        color: #1e293b;
    }

    p {
        color: #64748b;
        margin: 10px 0 25px;
    }
}

.achievement-card {
    background: linear-gradient(135deg, #00d2ff 0%, #3a47d5 100%);
    padding: 40px;
    border-radius: 32px;
    text-align: center;
    color: white;
    position: relative;
    max-width: 360px;
    width: 100%;
    overflow: hidden;

    .glow-ring {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 250px;
        height: 250px;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
        transform: translate(-50%, -50%);
        animation: pulse 3s infinite;
    }

    h3 {
        font-size: 0.7rem;
        letter-spacing: 2px;
        opacity: 0.8;
    }

    h2 {
        font-size: 2rem;
        font-weight: 900;
        margin: 10px 0;
    }

    .badge-container {
        margin: 20px 0;
        animation: float 4s ease-in-out infinite;
    }

    .white-btn {
        background: white;
        color: #3a47d5;
        padding: 12px 30px;
        border-radius: 12px;
        font-weight: 800;
        border: none;
        cursor: pointer;
    }
}

.loading-container {
    text-align: center;

    .loader {
        font-size: 60px;
        color: #3a47d5;
    }

    p {
        margin-top: 15px;
        color: #64748b;
        font-weight: 500;
    }
}

.primary-btn {
    width: 100%;
    padding: 14px;
    background: #3a47d5;
    color: white;
    border: none;
    border-radius: 14px;
    font-weight: 700;
    cursor: pointer;
}

/* Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: all 0.4s ease;

    .summary-card,
    .achievement-card {
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;

    .summary-card,
    .achievement-card {
        transform: scale(0.9) translateY(20px);
        opacity: 0;
    }
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-10px);
    }
}

@keyframes pulse {

    0%,
    100% {
        transform: translate(-50%, -50%) scale(0.9);
        opacity: 0.4;
    }

    50% {
        transform: translate(-50%, -50%) scale(1.1);
        opacity: 0.7;
    }
}
</style>