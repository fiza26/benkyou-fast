<script setup>
import { ref, watchEffect, onMounted } from 'vue'
import axios from 'axios'
import { Icon } from '@iconify/vue'
import supabase from '@/supabase'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()

const modalState = ref(true)

const textsLearningState = ref(false)
const imagesLearningState = ref(false)

const textsLearning = () => {
    textsLearningState.value = true
    modalState.value = false
}

const imagesLearning = () => {
    imagesLearningState.value = true
    modalState.value = false
}

const closeModal = () => {
    history.back()
}

onMounted(async () => {
    if (userStore.name) {
        await getWordsAdvancedLearning()
    }
})

const advancedLearningWords = ref([])
const textIndex = ref(0)

async function getWordsAdvancedLearning() {
    const { data, error } = await supabase.from('advanced_learning')
        .select('*')
        .eq('name', userStore.name)
        .eq('is_it_learned', false)
        .order('id', { ascending: true }) // <-- ADD THIS LINE

    if (error) {
        console.error('Error fetching words from advanced learning', error.message)
    }

    // advancedLearningWords.value = data


    advancedLearningWords.value = data.sort((a, b) => a.id - b.id);


    if (data.length > 0) {
        advancedTexts(data[0])
    }
}

const learningTexts = ref('')
const countWord = ref(0)

// Change advancedTexts to accept the word object
const advancedTexts = async (currentWord) => {
    if (!currentWord) {
        // Handle case where array might be empty (all words learned)
        learningTexts.value = "You have finished all words!";
        return;
    }

    try {
        const response = await axios.post(`http://localhost:3000/gemini`, {
            // PASS THE WORD OBJECT TO THE BACKEND
            wordData: currentWord,
            countWord: Number(countWord.value)
        })
        console.log('Response:', response.data.result)
        learningTexts.value = response.data.result
    } catch (error) {
        console.log(error)
    }
}

const loadingState = ref(false)

const doneModalState = ref(false)

const doneModal = () => {
    doneModalState.value = true
}

// Recommended Change:
const nextWord = async () => {
    try {
        loadingState.value = true

        // 1. Mark the CURRENT word as learned and update points (before changing text/index)
        await isItLearned()
        await userStore.updatePoints()

        // 2. Advance the index to the next word
        textIndex.value++

        // 3. Check if there are more words to display in the UI array
        if (textIndex.value >= advancedLearningWords.value.length) {
            // All words in the fetched list are learned. Show the done modal or handle end state.
            loadingState.value = false;
            doneModal();
            return;
        }

        // 4. Increment countWord and fetch the new text from the API
        countWord.value++
        console.log('Count Word:', countWord.value)

        const currentWord = advancedLearningWords.value[textIndex.value]

        const response = await axios.post(`http://localhost:3000/gemini`, {
            wordData: currentWord,
            countWord: Number(countWord.value)
        })

        console.log('Response:', response.data.result)
        learningTexts.value = response.data.result

    } catch (error) {
        console.log(error)
    } finally {
        loadingState.value = false
    }
}

const isItLearned = async () => {
    const currentWord = advancedLearningWords.value[textIndex.value]
    if (!currentWord) return
    await supabase.from('advanced_learning')
        .update({ is_it_learned: true })
        .eq('id', currentWord.id)
        .eq('name', userStore.name)
}

</script>

<template>
    <main>
        <div class="modal" v-if="modalState">
            <div class="modal-content">
                <h1>Choose your way of learning today!</h1><br>
                <div class="learning-choice">
                    <span @click="textsLearning()">Language acquisition through texts</span>
                    <!-- <span @click="imagesLearning()">Language acquisition through images</span> -->
                </div>
                <button @click="closeModal()">Close</button>
            </div>
        </div>
        <div class="modal" v-if="doneModalState">
            <div class="modal-content">
                <Icon icon="solar:confetti-outline" style="vertical-align: middle; color: white; font-size: 130px;" />
                <h3>You have learned all the words in advanced learning! You can learn new words back on homepage or you
                    can reset it so you can learn again from the start.
                </h3><br>
                <button @click="closeModal()">Close</button>
            </div>
        </div>
        <div class="container">
            <div class="card" v-if="textsLearningState">
                <div v-if="learningTexts === ''" class="loading">
                    <Icon icon="line-md:loading-twotone-loop" style="color: black; font-size: 100px;" />
                </div>
                <h3>{{ textIndex + 1 }} / {{ advancedLearningWords.length }}</h3>
                <div v-if="loadingState" class="loading">
                    <Icon icon="line-md:loading-twotone-loop" style="color: black; font-size: 100px;" />
                </div>
                <div class="learning-text" v-if="!loadingState">
                    <div v-for="line in learningTexts.split('\n')" :key="line">{{ line }}</div>
                </div>
                <hr>
                <button class="buttonForTexts" @click="nextWord()"
                    v-if="learningTexts && textIndex < advancedLearningWords.length">Next</button>
                <button class="buttonForTexts" @click="doneModal()"
                    v-if="learningTexts && textIndex === advancedLearningWords.length">Done</button>
            </div>
            <div class="card" v-if="imagesLearningState">
                <h1>Image goes here...</h1>
                <p>Choose the word that relate with the image or picture above</p>
                <hr>
                <div class="choice">
                    <button>同感</button>
                    <button>同感</button>
                    <button>同感</button>
                    <button>同感</button>
                </div>
            </div>
        </div>
    </main>
</template>

<style lang="scss" scoped>
* {
    margin: 0px;
    padding: 0px;
    box-sizing: border-box;
}

main {
    margin-top: 80px;
}

hr {
    margin-top: 20px;
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

        .learning-choice {
            display: flex;
            justify-content: space-evenly;
            flex-wrap: wrap;

            span {
                margin-top: 10px;
                margin-bottom: 10px;
                padding: 5px;
                border-radius: 15px;
                border: 1px solid white;
                width: 500px;
                cursor: pointer;
                transition: ease-in-out 0.5s;

                &:hover {
                    background-color: white;
                    color: black;
                }
            }
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

    .card {
        max-width: 100%;
        border-radius: 15px;
        padding: 40px;
        background-color: #ecf0f1;
        box-shadow: 10px 10px 46px -19px rgba(0, 0, 0, 0.75);

        .loading {
            display: flex;
            justify-content: center;
        }

        .learning-text {
            margin-top: 20px;

            div {
                font-size: 1.3rem;
                margin-bottom: 10px;
                line-height: 1.6;

                &:nth-child(1) {
                    color: #2c3e50; // Japanese
                    font-weight: 600;
                }

                &:nth-child(2) {
                    color: #34495e; // Romaji
                    font-style: italic;
                }

                &:nth-child(3) {
                    color: #16a085; // English
                }
            }
        }

        .buttonForTexts {
            font-family: "Poppins", sans-serif;
            margin-top: 10px;
            width: 100%;
            padding: 5px;
            border: none;
            border-radius: 15px;
            color: white;
            cursor: pointer;
            transition: ease-in-out 0.75s;
            background: linear-gradient(90deg, #00d2ff 0%, #3a47d5 100%);

            &:hover {
                transform: scale(1.025)
            }
        }

        .choice {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;

            button {
                font-family: "Poppins", sans-serif;
                width: 500px;
                margin-top: 15px;
                border-radius: 15px;
                border: none;
                padding: 7px;
                color: white;
                cursor: pointer;
                font-size: 50px;
                transition: ease-in-out 0.5s;
                background: linear-gradient(90deg, #00d2ff 0%, #3a47d5 100%);

                &:hover {
                    transform: scale(1.020);
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

@media (max-width: 768px) {
    .modal .modal-content {
        height: 80%;
    }
}
</style>