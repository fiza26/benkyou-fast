<script setup>
import { ref, computed, watch } from 'vue'
import axios from 'axios'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import confetti from 'canvas-confetti'
import supabase from '@/supabase'

const router = useRouter()

const learnedWords = ref([''])

async function fetchWords() {
    const { data, error } = await supabase.from('words').select()
    if (data) {
        learnedWords.value = data
    } else {
        console.log(error)
    }
    console.log(learnedWords.value)
}
fetchWords()

const vocabulary = ref([])
const wordLevel = ref(1)

const getVocab = async () => {
    try {
        const response = await axios.get(`https://jlpt-vocab-api.vercel.app/api/words/all?level=${wordLevel.value}`)
        console.log('Full Response:', response.data)
        if (response.data) {
            // vocabulary.value = response.data
            // Filter out words that are already learned
            vocabulary.value = response.data.filter(word =>
                !learnedWords.value.some(learned => learned.word === word.word)
            )
        }
        console.log('Vocabulary:', vocabulary.value)
    } catch (error) {
        console.log('Error loading vocabulary:', error)
    }
}
getVocab()

const currentWord = ref(0)
const message = ref('')

const nextWord = (word) => {
    if (currentWord.value < vocabulary.value.length - 1) {
        vocabulary.value[currentWord.value]
        currentWord.value++
        confetti()
    } else if (wordLevel.value === 5) {
        message.value = 'You have learnt all the words from level 1 to level 5'
        stop()
    } else {
        wordLevel.value++
        currentWord.value = 0
        getVocab()
    }
    saveWord(word)
}

async function saveWord(word) {
    const { error } = await supabase.from('words').insert({
        word: word.word,
        meaning: word.meaning,
        furigana: word.furigana,
        romaji: word.romaji,
        level: word.level
    })

    if (error) {
        console.log(error)
        window.alert('Insert error')
    }
}

const fiftyWordsAchievement = ref(false)
const onehundredWordsAchievement = ref(false)
const threehundredWordsAchievement = ref(false)
const onethousandWordsAchievement = ref(false)

watch(currentWord, (newValue) => {
    if (newValue === 50) {
        console.log("Achievement unlocked: Learned 50 words!")
        fiftyWordsAchievement.value = true
        triggerConfetti()
    } else if (newValue === 100) {
        console.log("Achievement unlocked: Learned 100 words!")
        onehundredWordsAchievement.value = true
        triggerConfetti()
    } else if (newValue === 300) {
        console.log("Achievement unlocked: Learned 300 words!")
        threehundredWordsAchievement.value = true
        triggerConfetti()
    } else if (newValue === 1000) {
        console.log("Achievement unlocked: Learned 1000 words!")
        onehundredWordsAchievement.value = true
        triggerConfetti()
    }
})

const triggerConfetti = () => {
    confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.6 }  // Confetti will fall from near the middle of the screen
    })
}

const modalState = ref(false)
const stop = () => {
    modalState.value = true
}

const ok = () => {
    router.push('/')
}

const achievementOkay = () => {
    fiftyWordsAchievement.value = false
    onehundredWordsAchievement.value = false
    threehundredWordsAchievement.value = false
    onethousandWordsAchievement.value = false
}
</script>

<template>
    <main>
        <div class="modal" v-if="modalState">
            <div class="modal-content">
                <h1>You have learned {{ currentWord }} words this session
                    <Icon icon="solar:confetti-outline" style="vertical-align: middle; color: white" />
                </h1>
                <button @click="ok()">Ok</button>
            </div>
        </div>
        <div class="modal" v-if="fiftyWordsAchievement || onehundredWordsAchievement || threehundredWordsAchievement">
            <div class="achievement-content">
                <h2>New Achievement Unlocked</h2>
                <img src="../assets/50-words.png" alt="" v-if="fiftyWordsAchievement">
                <img src="../assets/100-words.png" alt="" v-if="onehundredWordsAchievement">
                <img src="../assets/300-words.png" alt="" v-if="threehundredWordsAchievement">
                <img src="../assets/1000-words.png" alt="" v-if="onethousandWordsAchievement">
                <button @click="achievementOkay()">Okay</button>
            </div>
        </div>
        <div class="container">
            <div class="card-container" v-if="!modalState">
                <div class="card" v-if="vocabulary.length > 0">
                    <p>{{ currentWord }}</p>
                    <h1>{{ vocabulary[currentWord].word }}</h1>
                    <p>{{ vocabulary[currentWord].meaning }}</p>
                    <p>{{ vocabulary[currentWord].furigana }}</p>
                    <p>{{ vocabulary[currentWord].romaji }}</p>
                    <!-- <p>{{ vocabulary[currentWord].level }}</p> -->
                    <p v-if="message">{{ message }}</p>
                    <div class="button-action">
                        <button @click="nextWord(vocabulary[currentWord])">Next ></button>
                        <button @click="stop()" v-if="currentWord > 0">Stop ></button>
                    </div>
                </div>
                <div v-else>
                    <Icon icon="line-md:loading-twotone-loop" style="color: black; font-size: 100px;" />
                </div>
            </div>
        </div>
    </main>
</template>

<style lang="scss" scoped>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

main {
    margin-top: 80px;
}

hr {
    border: 1px solid white;
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.5s ease;

    .modal-content {
        animation: moveUp 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
        background: linear-gradient(90deg, #00d2ff 0%, #3a47d5 100%);
        color: white;
        padding: 20px;
        border-top-left-radius: 15px;
        border-top-right-radius: 15px;
        width: 70%;
        height: 50%;
        position: fixed;
        bottom: 0;
        text-align: center;
        -webkit-box-shadow: 10px 10px 46px -19px rgba(0, 0, 0, 0.75);
        -moz-box-shadow: 10px 10px 46px -19px rgba(0, 0, 0, 0.75);
        box-shadow: 10px 10px 46px -19px rgba(0, 0, 0, 0.75);

        button {
            font-family: "Poppins", sans-serif;
            margin-top: 13px;
            border: none;
            padding: 5px;
            border-radius: 15px;
            width: 30%;
            background-color: white;
            transition: ease-in-out 0.5s;
            cursor: pointer;

            &:hover {
                transform: scale(1.030);
            }
        }
    }

    .achievement-content {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: white;
        animation: moveUp 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;


        img {
            width: 400px;
            animation: moveUp 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
        }

        button {
            font-family: "Poppins", sans-serif;
            margin-top: 13px;
            border: none;
            padding: 5px;
            border-radius: 15px;
            width: 30%;
            background-color: white;
            transition: ease-in-out 0.5s;
            cursor: pointer;

            &:hover {
                transform: scale(1.030);
            }
        }
    }
}

.container {
    margin: 80px;
    display: flex;
    flex-direction: column;
    transition: ease-in-out 0.5s;

    .card-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;

        .card {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            text-align: center;
            font-family: "Poppins", sans-serif;
            background-color: #ecf0f1;
            width: 350px;
            height: 350px;
            padding: 13px;
            border-radius: 15px;
            box-shadow: 10px 10px 46px -19px rgba(0, 0, 0, 0.75);
            margin-top: 30px;
            margin-bottom: 15px;
            transition: ease-in-out 0.5s;
            backdrop-filter: blur(10px);

            .button-action {
                width: 100%;

                button {
                    font-family: "Poppins", sans-serif;
                    border: none;
                    padding: 5px;
                    margin-top: 5px;
                    border-radius: 15px;
                    background: linear-gradient(90deg, #00d2ff 0%, #3a47d5 100%);
                    color: white;
                    transition: ease-in-out 0.5s;
                    cursor: pointer;

                    &:hover {
                        transform: scale(1.030);
                    }
                }
            }
        }
    }
}

@keyframes moveUp {
    0% {
        transform: scale(0);
        opacity: 0;
    }

    50% {
        border-radius: 15px;
    }

    90% {
        border-radius: 15px;
    }

    100% {
        transform: scale(1);
        opacity: 1;
    }
}

</style>