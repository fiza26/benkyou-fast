<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { Icon } from '@iconify/vue'
import supabase from '@/supabase'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()

// State management
const modalState = ref(true)
const textsLearningState = ref(false)
const doneModalState = ref(false)
const loadingState = ref(false)

// Toast logic
const toast = ref({ show: false, message: '', type: 'info' })

const triggerToast = (msg, type = 'info') => {
    toast.value = { show: true, message: msg, type }
    setTimeout(() => { toast.value.show = false }, 3000)
}

// Word & AI State
const advancedLearningWords = ref([])
const textIndex = ref(0)
const learningTexts = ref('')

// Audio Pronunciation
const speak = (text) => {
    window.speechSynthesis.cancel()
    // Clean text: removes "Japanese: " and markdown bold stars for speech
    const cleanText = text.replace('Japanese: ', '').replace(/\*/g, '')
    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = 'ja-JP'
    utterance.rate = 0.85
    window.speechSynthesis.speak(utterance)
}

const getWordsAdvancedLearning = async () => {
    if (!userStore.name) return

    const { data, error } = await supabase.from('advanced_learning')
        .select('*')
        .eq('name', userStore.name)
        .eq('is_it_learned', false)
        .order('id', { ascending: true })

    if (error) {
        console.error('Error fetching words:', error.message)
        return
    }
    advancedLearningWords.value = data || []
}

onMounted(() => { getWordsAdvancedLearning() })

watch(() => userStore.name, (newName) => {
    if (newName) getWordsAdvancedLearning()
})

const startLearning = async () => {
    if (advancedLearningWords.value.length === 0) {
        modalState.value = false
        doneModalState.value = true
        return
    }
    textsLearningState.value = true
    modalState.value = false
    await fetchContent()
}

const fetchContent = async () => {
    loadingState.value = true
    learningTexts.value = ''

    try {
        const currentWordData = advancedLearningWords.value[textIndex.value]
        const response = await axios.post(`http://localhost:3000/gemini`, {
            word: currentWordData.word
        })

        if (response.data && response.data.result) {
            learningTexts.value = response.data.result
        }
    } catch (error) {
        console.error("Gemini Error:", error)
        learningTexts.value = "Error: Failed to load content."
        triggerToast("AI Connection Failed", "warning")
    } finally {
        loadingState.value = false
    }
}

const nextWord = async () => {
    if (loadingState.value) return

    try {
        loadingState.value = true
        const currentWord = advancedLearningWords.value[textIndex.value]

        const { error } = await supabase.from('advanced_learning')
            .update({ is_it_learned: true })
            .eq('id', currentWord.id)

        if (error) throw error

        await userStore.updatePoints()
        triggerToast("+10 Points! Word Mastered.", "success")

        textIndex.value++

        if (textIndex.value >= advancedLearningWords.value.length) {
            textsLearningState.value = false
            doneModalState.value = true
        } else {
            await fetchContent()
        }
    } catch (error) {
        console.error("Progression error:", error)
        triggerToast("Error saving progress", "warning")
    } finally {
        loadingState.value = false
    }
}

const closeModal = () => history.back()
</script>

<template>
    <main>
        <Transition name="toast">
            <div v-if="toast.show" class="toast-card" :class="toast.type">
                <Icon :icon="toast.type === 'success' ? 'solar:check-circle-bold' : 'solar:info-circle-bold'" />
                <span>{{ toast.message }}</span>
            </div>
        </Transition>

        <Transition name="modal">
            <div class="modal-overlay" v-if="modalState">
                <div class="modal-content">
                    <div class="sparkle-container">✨
                        <Icon icon="solar:star-bold" width="60" class="modal-icon" /> ✨
                    </div>
                    <h1>Advanced Acquisition</h1>
                    <p>Unlock deep mastery through AI context.</p>
                    <div class="modal-actions">
                        <button class="primary-white-btn" @click="startLearning">Start Learning</button>
                        <button class="text-white-btn" @click="closeModal">Cancel</button>
                    </div>
                </div>
            </div>
        </Transition>

        <Transition name="modal">
            <div class="modal-overlay" v-if="doneModalState">
                <div class="modal-content">
                    <div class="sparkle-container">✨
                        <Icon icon="solar:confetti-bold" width="80" class="modal-icon" /> ✨
                    </div>
                    <h3>Session Complete!</h3>
                    <p>All words mastered. Your fluency is growing!</p>
                    <button class="primary-white-btn" @click="closeModal">Finish Session</button>
                </div>
            </div>
        </Transition>

        <div class="container" v-if="textsLearningState">
            <div class="learning-card">
                <div class="progress-section">
                    <div class="progress-text">
                        <span class="count">{{ textIndex + 1 }} / {{ advancedLearningWords.length }}</span>
                        <span class="current-word">Word: <strong>{{ advancedLearningWords[textIndex]?.word
                        }}</strong></span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar"
                            :style="{ width: ((textIndex + 1) / advancedLearningWords.length * 100) + '%' }"></div>
                    </div>
                </div>

                <div class="content-body">
                    <div v-if="loadingState" class="loading-box">
                        <Icon icon="line-md:loading-twotone-loop" class="spinner" />
                        <p>AI is thinking...</p>
                    </div>

                    <div class="learning-text" v-else-if="learningTexts">
                        <div v-for="(line, idx) in learningTexts.split('\n')" :key="idx" class="text-line"
                            :class="{ 'is-header': idx === 0 }">
                            <div class="line-content">{{ line }}</div>
                            <button v-if="idx === 0" @click="speak(line)" class="audio-btn">
                                <Icon icon="solar:volume-loud-bold" />
                            </button>
                        </div>
                    </div>
                </div>

                <div class="card-footer">
                    <button class="action-btn" @click="nextWord" :disabled="loadingState">
                        {{ textIndex + 1 === advancedLearningWords.length ? 'Finish & Save' : 'Master Word' }}
                        <Icon icon="solar:alt-arrow-right-bold" />
                    </button>
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
    min-height: 100vh;
    font-family: 'Poppins', sans-serif;
}

/* Toast (Shared UI) */
.toast-card {
    position: fixed;
    bottom: 30px;
    right: 30px;
    z-index: 2000;
    padding: 16px 24px;
    border-radius: 16px;
    background: #1e293b;
    color: white;
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 600;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);

    &.success {
        background: #10b981;
    }

    &.warning {
        background: #f59e0b;
    }
}

/* Modal Overlay & Card */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.7);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: linear-gradient(135deg, #00d2ff 0%, #3a47d5 100%);
    color: white;
    padding: 40px;
    border-radius: 28px;
    width: 90%;
    max-width: 500px;
    text-align: center;
    box-shadow: 0 25px 50px rgba(58, 71, 213, 0.4);

    .sparkle-container {
        font-size: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        margin-bottom: 20px;
    }

    h1 {
        font-size: 2rem;
        margin-bottom: 10px;
    }

    p {
        margin-bottom: 30px;
        opacity: 0.9;
    }
}

.modal-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.primary-white-btn {
    background: white;
    color: #3a47d5;
    border: none;
    padding: 16px;
    border-radius: 50px;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    transition: 0.3s;

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }
}

.text-white-btn {
    background: transparent;
    border: none;
    color: white;
    font-weight: 600;
    cursor: pointer;
    opacity: 0.8;

    &:hover {
        opacity: 1;
    }
}

/* Learning Layout */
.container {
    max-width: 800px;
    margin: 0 auto;
    padding: 40px 20px;
}

.learning-card {
    background: white;
    border-radius: 28px;
    padding: 40px;
    border: 1px solid #f1f5f9;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.05);

    .progress-section {
        margin-bottom: 35px;

        .progress-text {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;

            .count {
                color: #3a47d5;
                font-weight: 800;
                font-size: 1.1rem;
            }

            .current-word {
                color: #64748b;
            }
        }

        .progress-bar-container {
            height: 10px;
            background: #f1f5f9;
            border-radius: 20px;
            overflow: hidden;

            .progress-bar {
                height: 100%;
                background: linear-gradient(90deg, #00d2ff, #3a47d5);
                transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
        }
    }
}

.loading-box {
    text-align: center;
    padding: 80px 0;

    .spinner {
        font-size: 60px;
        color: #3a47d5;
        margin-bottom: 20px;
    }
}

.learning-text {
    .text-line {
        margin-bottom: 12px;
        padding: 14px 20px;
        background: #f8fafc;
        border-radius: 12px;
        line-height: 1.6;
        color: #334155;
        white-space: pre-wrap;
        /* Keeps line breaks from AI */

        &.is-header {
            background: #f0f9ff;
            border-left: 5px solid #00d2ff;
            font-size: 1.5rem;
            font-weight: 700;
            color: #1e293b;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .audio-btn {
            background: white;
            border: 2px solid #e2e8f0;
            color: #3a47d5;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;

            &:hover {
                border-color: #3a47d5;
                background: #3a47d5;
                color: white;
            }
        }
    }
}

.action-btn {
    width: 100%;
    margin-top: 40px;
    background: #1e293b;
    color: white;
    padding: 18px;
    border-radius: 16px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    border: none;
    cursor: pointer;
    transition: 0.3s;

    &:hover:not(:disabled) {
        background: #334155;
        transform: translateY(-2px);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
}

/* Animations */
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.4s ease;

    .modal-content {
        transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;

    .modal-content {
        transform: translateY(100px) scale(0.8);
    }
}

.toast-enter-active,
.toast-leave-active {
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-enter-from {
    opacity: 0;
    transform: translateY(40px) scale(0.8);
}

.toast-leave-to {
    opacity: 0;
    transform: translateX(40px);
}
</style>