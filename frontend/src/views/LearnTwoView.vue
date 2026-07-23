<script setup>
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import supabase from '@/supabase'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()

const learnedWords = ref([])
const words = ref([])
const showRelearnForm = ref(false)
const howManyWords = ref(null)
const wordLevel = ref(null)
const sortedWords = ref([])
const sortedWordsLoading = ref(false)
const wordSlice = ref(12)

// Toast Notification State
const toast = ref({ show: false, message: '', type: 'info' })

const triggerToast = (msg, type = 'info') => {
    toast.value = { show: true, message: msg, type }
    setTimeout(() => { toast.value.show = false }, 3000)
}

onMounted(async () => {
    await userStore.getCurrentUser()
    fetchWords()
    getWords()
})

async function fetchWords() {
    const { data, error } = await supabase.from('words').select()
    if (data) learnedWords.value = data
    else console.error(error)
}

async function getWords() {
    const { data, error } = await supabase.from('advanced_learning').select()
    if (data) words.value = data
}

const relearnState = () => {
    showRelearnForm.value = !showRelearnForm.value
}

const relearnWords = () => {
    const numWords = parseInt(howManyWords.value) || 0
    const level = parseInt(wordLevel.value) || 0

    if (!numWords || level < 1 || level > 5) {
        triggerToast('Please enter a valid number and level', 'warning')
        return
    }

    const availableWords = learnedWords.value.filter(word => Number(word.level) === level)

    if (availableWords.length === 0) {
        triggerToast(`No N${level} words found in your history.`, 'warning')
        return
    }

    sortedWordsLoading.value = true

    // Logic: Shuffle and Slice
    sortedWords.value = [...availableWords]
        .sort(() => Math.random() - 0.5)
        .slice(0, numWords)

    setTimeout(() => {
        sortedWordsLoading.value = false
        showRelearnForm.value = false
        triggerToast(`Generated ${sortedWords.value.length} words for review!`, 'success')
    }, 800)
}

function checkIfWordExists(word) {
    return words.value.some(advanced => advanced.word === word.word)
}

async function advancedLearning(word) {
    if (!userStore.name) {
        triggerToast('User session loading...', 'info')
        return
    }

    if (checkIfWordExists(word)) {
        triggerToast('Already in Advanced Learning', 'info')
        return
    }

    const { error } = await supabase.from('advanced_learning').insert({
        word: word.word,
        meaning: word.meaning,
        furigana: word.furigana,
        romaji: word.romaji,
        level: word.level,
        name: userStore.name,
        username: userStore.username,
        is_it_learned: false
    })

    if (!error) {
        words.value.push(word)
        triggerToast(`Added ${word.word} to Advanced Learning`, 'success')
    }
}

const showMore = () => { wordSlice.value = learnedWords.value.length }
const showLess = () => { wordSlice.value = 12 }
</script>

<template>
    <main>
        <Transition name="toast">
            <div v-if="toast.show" class="toast-card" :class="toast.type">
                <Icon :icon="toast.type === 'success' ? 'solar:check-circle-bold' : 'solar:info-circle-bold'" />
                <span>{{ toast.message }}</span>
            </div>
        </Transition>

        <div class="container">
            <div class="page-header">
                <div class="relearn-banner">
                    <div class="banner-text">
                        <h2>Memory Refresh</h2>
                        <p>Keep your vocabulary sharp by revisiting words you've already mastered.</p>
                    </div>
                    <button @click="relearnState()" :class="{ 'btn-active': showRelearnForm }">
                        <Icon :icon="showRelearnForm ? 'solar:close-circle-bold' : 'solar:play-circle-bold'" />
                        {{ showRelearnForm ? 'Cancel' : 'Setup Session' }}
                    </button>
                </div>

                <Transition name="slide">
                    <div class="setup-form-card" v-if="showRelearnForm">
                        <div class="form-grid">
                            <div class="input-group">
                                <label>Session Size</label>
                                <input type="number" placeholder="e.g. 20 words" v-model="howManyWords">
                            </div>
                            <div class="input-group">
                                <label>JLPT Level</label>
                                <select v-model="wordLevel">
                                    <option :value="null" disabled>Select Level</option>
                                    <option v-for="n in 5" :key="n" :value="n">N{{ n }}</option>
                                </select>
                            </div>
                        </div>
                        <button class="submit-btn" @click="relearnWords()" :disabled="sortedWordsLoading">
                            {{ sortedWordsLoading ? 'Randomizing...' : 'Start Refresh' }}
                        </button>
                    </div>
                </Transition>
            </div>

            <div class="content-section">
                <div class="section-title" v-if="sortedWords.length > 0">
                    <h3>Focusing on <span>{{ sortedWords.length }}</span> review words</h3>
                    <button class="text-btn" @click="sortedWords = []">
                        <Icon icon="solar:restart-bold" /> Reset Filter
                    </button>
                </div>

                <div class="card-grid">
                    <div v-if="sortedWordsLoading || learnedWords.length === 0" class="loader-box">
                        <Icon icon="line-md:loading-twotone-loop" class="spinner" />
                        <p>Syncing your progress...</p>
                    </div>

                    <template v-else>
                        <div v-for="word in (sortedWords.length > 0 ? sortedWords : learnedWords.slice(0, wordSlice))"
                            :key="word.id" class="vocab-card" :class="{ 'is-advanced': checkIfWordExists(word) }"
                            @click="advancedLearning(word)">

                            <div class="card-badge" v-if="checkIfWordExists(word)">
                                <Icon icon="solar:star-bold" />
                            </div>

                            <div class="card-top">
                                <span class="furigana">{{ word.furigana }}</span>
                                <h1 class="kanji">{{ word.word }}</h1>
                            </div>

                            <div class="card-bottom">
                                <p class="meaning">{{ word.meaning }}</p>
                                <div class="card-footer">
                                    <span class="level-tag">N{{ word.level }}</span>
                                    <span class="romaji">{{ word.romaji }}</span>
                                </div>
                            </div>

                            <div class="hover-overlay" v-if="!checkIfWordExists(word)">
                                <Icon icon="solar:add-circle-bold" />
                                <span>Add to Advanced</span>
                            </div>
                        </div>
                    </template>
                </div>

                <div class="pagination-area" v-if="learnedWords.length > 12 && sortedWords.length === 0">
                    <button v-if="wordSlice === 12" @click="showMore()" class="load-btn">
                        <Icon icon="solar:Alt-arrow-down-bold" />
                        Show All Learned ({{ learnedWords.length }})
                    </button>
                    <button v-else @click="showLess()" class="load-btn secondary">
                        <Icon icon="solar:alt-arrow-up-bold" />
                        Show Less
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
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
}

/* Toast Notification Styles */
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

    &.info {
        background: #3a47d5;
    }

    svg {
        font-size: 20px;
    }
}

/* Page Banner & Action Button */
.relearn-banner {
    background: linear-gradient(135deg, #00d2ff 0%, #3a47d5 100%);
    border-radius: 24px;
    padding: 30px 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: white;
    box-shadow: 0 10px 30px rgba(58, 71, 213, 0.2);
    margin-bottom: 20px;

    .banner-text h2 {
        font-size: 1.8rem;
        margin-bottom: 5px;
    }

    .banner-text p {
        opacity: 0.9;
        font-size: 0.95rem;
    }

    button {
        background: white;
        color: #3a47d5;
        border: none;
        padding: 12px 24px;
        border-radius: 14px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        transition: 0.3s;

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        &:active {
            transform: scale(0.95);
        }

        &.btn-active {
            background: #1e293b;
            color: white;
        }
    }
}

/* Form Styles */
.setup-form-card {
    background: white;
    border-radius: 20px;
    padding: 30px;
    margin-bottom: 40px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    border: 1px solid #e2e8f0;

    .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 20px;
    }

    .input-group label {
        display: block;
        font-size: 0.85rem;
        font-weight: 600;
        color: #64748b;
        margin-bottom: 8px;
    }

    input,
    select {
        width: 100%;
        padding: 12px 16px;
        border-radius: 12px;
        border: 2px solid #f1f5f9;
        font-family: inherit;

        &:focus {
            border-color: #00d2ff;
            outline: none;
        }
    }
}

.submit-btn {
    width: 100%;
    background: #1e293b;
    color: white;
    border: none;
    padding: 14px;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: 0.3s;

    &:hover {
        background: #334155;
    }

    &:active {
        transform: translateY(1px);
    }

    &:disabled {
        background: #94a3b8;
        cursor: not-allowed;
        opacity: 0.7;
    }
}

/* Vocabulary Grid & Cards */
.section-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 2px solid #f1f5f9;

    h3 {
        color: #1e293b;
        font-weight: 700;

        span {
            color: #3a47d5;
        }
    }
}

.text-btn {
    background: none;
    border: none;
    color: #64748b;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 8px;
    transition: 0.2s;

    &:hover {
        background: #fef2f2;
        color: #ef4444;
    }
}

.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 25px;
}

.vocab-card {
    background: white;
    border-radius: 20px;
    padding: 24px;
    position: relative;
    border: 1px solid #f1f5f9;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 220px;
    overflow: hidden;

    &:hover:not(.is-advanced) {
        transform: translateY(-5px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.06);

        .hover-overlay {
            opacity: 1;
        }
    }

    &.is-advanced {
        background: linear-gradient(145deg, #ffffff 0%, #f0f9ff 100%);
        border-color: #00d2ff;
        cursor: default;

        .kanji {
            color: #3a47d5;
        }
    }

    .card-badge {
        position: absolute;
        top: 15px;
        right: 15px;
        color: #00d2ff;
        font-size: 1.2rem;
    }

    .card-top .furigana {
        display: block;
        font-size: 0.85rem;
        color: #94a3b8;
    }

    .card-top .kanji {
        font-size: 2.2rem;
        margin: 5px 0;
        color: #1e293b;
    }

    .meaning {
        color: #475569;
        font-size: 1rem;
        line-height: 1.4;
        margin-bottom: 15px;
    }

    .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid #f8fafc;
        padding-top: 15px;

        .level-tag {
            background: #f1f5f9;
            padding: 4px 10px;
            border-radius: 8px;
            font-size: 0.75rem;
            font-weight: 700;
            color: #64748b;
        }

        .romaji {
            font-size: 0.8rem;
            color: #94a3b8;
            font-style: italic;
        }
    }

    .hover-overlay {
        position: absolute;
        inset: 0;
        background: rgba(58, 71, 213, 0.95);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        gap: 10px;
        opacity: 0;
        transition: 0.2s ease-in-out;
        backdrop-filter: blur(4px);
        font-weight: 600;
    }
}

/* Pagination & Loading */
.pagination-area {
    margin-top: 50px;
    display: flex;
    justify-content: center;
    gap: 15px;
}

.load-btn {
    background: white;
    border: 2px solid #e2e8f0;
    padding: 12px 40px;
    border-radius: 50px;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
    transition: 0.3s;
    display: flex;
    align-items: center;
    gap: 10px;

    &:hover {
        border-color: #3a47d5;
        color: #3a47d5;
    }

    &.secondary {
        background: #f1f5f9;
        border-color: #cbd5e1;
        color: #475569;

        &:hover {
            background: #e2e8f0;
            border-color: #94a3b8;
            color: #1e293b;
        }
    }
}

.loader-box {
    grid-column: 1 / -1;
    text-align: center;
    padding: 100px 0;
    color: #94a3b8;

    .spinner {
        font-size: 60px;
        color: #3a47d5;
        margin-bottom: 15px;
    }
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
    transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
    opacity: 0;
    transform: translateY(-20px);
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

@media (max-width: 768px) {
    .relearn-banner {
        flex-direction: column;
        text-align: center;
        gap: 20px;
        padding: 30px 20px;
    }

    .form-grid {
        grid-template-columns: 1fr;
    }
}
</style>