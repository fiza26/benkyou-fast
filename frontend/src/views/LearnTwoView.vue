<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import supabase from '@/supabase'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()

onMounted(async () => {
    await userStore.getCurrentUser()
})

const learnedWords = ref([])

async function fetchWords() {
    const { data, error } = await supabase.from('words').select()
    if (data) {
        learnedWords.value = data
    } else {
        console.log(error)
    }
    console.log(learnedWords.value)
}

setTimeout(() => {
    fetchWords()
}, '1000')

const showRelearnForm = ref(false)

const relearnState = (() => {
    showRelearnForm.value = !showRelearnForm.value
})

const howManyWords = ref(null)
const wordLevel = ref(null)
const sortedWords = ref([])
const sortedWordsLoading = ref(false)

const relearnWords = () => {
    const numWords = parseInt(howManyWords.value) || 0
    const level = parseInt(wordLevel.value) || 0

    if (!numWords) {
        window.alert('Please enter a valid number of words')
        return
    } else if (!level || level > 5) {
        window.alert('Please enter a valid level')
        return
    }

    if (numWords > learnedWords.value.length) {
        window.alert('Number of words inputted is higher than the total of words learned')
        return
    }

    const levelExists = learnedWords.value.some(word => Number(word.level) === level)
    if (!levelExists) {
        window.alert('Level inputted is not available on learned words yet')
        return
    }

    sortedWords.value = learnedWords.value
        .filter(word => Number(word.level) === level) // Ensure `word.level` is a number
        .sort(() => Math.random() - 0.5) // Randomize
        .slice(0, numWords) // Limit number of words

    sortedWordsLoading.value = true

    loadingTimeout()

    console.log('Sorted Words:', sortedWords.value) // Debugging
}

const loadingTimeout = (() => {
    setTimeout(() => {
        sortedWordsLoading.value = false
    }, 1000)
})

const words = ref([])

async function getWords() {
    const { data, error } = await supabase.from('advanced_learning').select()

    if (data) {
        words.value = data
    } else {
        console.log('Error', error)
    }
}
getWords()

function checkIfWordExists(word) {
    return words.value.some(advanced => advanced.word === word.word)
}
checkIfWordExists()

console.log('Words from advanced learning', words.value)

async function advancedLearning(word) {
    if (!words.value.length) {
        window.alert('Words or user info not ready yet')
        return
    }

    if (!userStore.name || !userStore.username) {
        window.alert('User info is still loading, try again')
        return
    }

    const exists = words.value.some(advanced => advanced.word === word.word)

    if (exists) {
        window.alert('This word is already in advanced learning')
        return
    }

    const { error } = await supabase.from('advanced_learning').insert({
        word: word.word,
        meaning: word.meaning,
        furigana: word.furigana,
        romaji: word.romaji,
        level: word.level,
        name: userStore.name,
        username: userStore.username
    })

    if (error) {
        console.log(error)
        window.alert('Insert error')
    } else {
        words.value.push(word)
        window.alert('Selected word has been added to advanced learning')
    }
}

const wordSlice = ref(12)

const showMore = (() => {
    wordSlice.value = learnedWords.value.length
})

const showLess = (() => {
    wordSlice.value = 12
})

</script>

<template>
    <main>
        <div class="container">
            <div class="relearn-card">
                <h3>Relearn all the words you have learned so far to keep your memory of the vocabulary sharp.</h3>
                <button @click="relearnState()" v-if="!showRelearnForm">Start</button>
                <button @click="relearnState()" v-else>Close</button>
                <hr v-if="showRelearnForm">
                <div class="relearn-form" v-if="showRelearnForm">
                    <form @submit.prevent>
                        <label for="">How many words do you want to learn today?</label><br><br>
                        <input type="number" placeholder="Number of words" v-model="howManyWords"><br>
                        <label for="">Choose level</label><br><br>
                        <input type="number" placeholder="Choose level (1-5)" v-model="wordLevel"><br>
                        <button @click="relearnWords()">Ok</button>
                    </form>
                </div>
            </div>
            <div class="card-container">
                <div class="card" v-for="word in learnedWords.slice(0, wordSlice)" :key="word.id"
                    v-if="learnedWords.length > 0 && sortedWords.length < 1" @click="advancedLearning(word)"
                    :class="{ ifWordExists: checkIfWordExists(word) }">
                    <h1>{{ word.word }}</h1>
                    <p>{{ word.meaning }}</p>
                    <p>{{ word.furigana }}</p>
                    <p>{{ word.romaji }}</p>
                    <p>Level : {{ word.level }}</p>
                </div>
                <div class="no-data" v-if="learnedWords.length === 0 || sortedWordsLoading">
                    <Icon icon="line-md:loading-twotone-loop" style="color: black; font-size: 100px;" />
                </div>
                <div class="card" v-for="word in sortedWords" :key="word.id"
                    v-if="sortedWords.length > 0 && !sortedWordsLoading" @click="advancedLearning(word)"
                    :class="{ ifWordExists: checkIfWordExists(word) }">
                    <h1>{{ word.word }}</h1>
                    <p>{{ word.meaning }}</p>
                    <p>{{ word.furigana }}</p>
                    <p>{{ word.romaji }}</p>
                    <p>Level : {{ word.level }}</p>
                </div>
            </div>
            <div class="show-more" v-if="learnedWords.length > 12 && sortedWords.length < 1 && wordSlice === 12">
                <button @click="showMore()">Show More</button>
            </div>
            <div class="show-less" v-if="wordSlice !== 12">
                <button @click="showLess()">Show Less</button>
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
    margin-top: 20px;
}

.container {
    margin: 80px;
    display: flex;
    flex-direction: column;
    transition: ease-in-out 0.5s;
    overflow-x: hidden;

    .relearn-card {
        max-width: 100%;
        border-radius: 15px;
        color: white;
        padding: 15px;
        background: linear-gradient(90deg, #00d2ff 0%, #3a47d5 100%);

        button {
            font-family: "Poppins", sans-serif;
            border: none;
            border-radius: 15px;
            width: 100px;
            padding: 5px;
            margin-top: 10px;
            cursor: pointer;
            transition: ease-in-out 0.50s;

            &:hover {
                transform: scale(1.1);
            }
        }

        .relearn-form {
            margin-top: 10px;

            label {
                margin-bottom: 10px;
            }

            input {
                font-family: "Poppins", sans-serif;
                width: 100%;
                margin-bottom: 15px;
                border: none;
                border-radius: 15px;
                padding: 7px;
                background-color: #dddd;
            }

            button {
                width: 100%;

                &:hover {
                    transform: scale(1.010);
                }
            }
        }
    }

    .card-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;

        .card {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            text-align: center;
            font-family: "Poppins", sans-serif;
            background-color: #ecf0f1;
            width: 270px;
            height: 270px;
            padding: 13px;
            border-radius: 15px;
            box-shadow: 10px 10px 46px -19px rgba(0, 0, 0, 0.75);
            margin-top: 30px;
            margin-bottom: 15px;
            transition: ease-in-out 0.5s;
            backdrop-filter: blur(10px);
            cursor: pointer;
            animation: moveUp 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;

            &:hover {
                transform: scale(1.020);
            }

            &:active {
                color: white;
                background: linear-gradient(90deg, #00d2ff 0%, #3a47d5 100%);
            }

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

        .ifWordExists {
            background: linear-gradient(90deg, #00d2ff 0%, #3a47d5 100%);
            color: white;
        }

        .no-data {
            margin-top: 10px;
            margin-left: auto;
            margin-right: auto;
        }
    }

    .show-more {
        display: flex;
        justify-content: center;
        margin-top: 50px;

        button {
            font-family: "Poppins", sans-serif;
            background-color: red;
            padding: 7px;
            border: none;
            border-radius: 15px;
            width: 250px;
            color: white;
            text-align: center;
            cursor: pointer;
            transition: ease-in-out 0.25s;
            background: linear-gradient(90deg, #00d2ff 0%, #3a47d5 100%);

            &:hover {
                transform: scale(1.1)
            }
        }
    }

    .show-less {
        display: flex;
        justify-content: center;
        margin-top: 50px;

        button {
            font-family: "Poppins", sans-serif;
            background-color: red;
            padding: 7px;
            border: none;
            border-radius: 15px;
            width: 250px;
            color: white;
            text-align: center;
            cursor: pointer;
            transition: ease-in-out 0.25s;
            background: linear-gradient(90deg, #00d2ff 0%, #3a47d5 100%);

            &:hover {
                transform: scale(1.1)
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