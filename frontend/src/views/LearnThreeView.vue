<script setup>
import { ref, watchEffect } from 'vue'
import axios from 'axios'
import { Icon } from '@iconify/vue'

const modalState = ref(true)

const textsLearningState = ref(false)
const imagesLearningState = ref(false)

const textsLearning = (() => {
    textsLearningState.value = true
    modalState.value = false
})

const imagesLearning = (() => {
    imagesLearningState.value = true
    modalState.value = false
})

const closeModal = (() => {
    history.back()
})

const learningTexts = ref('')
const countWord = ref(0)

const advancedTexts = async () => {
    try {
        const response = await axios.post(`http://localhost:3000/gemini`, {
            countWord: Number(countWord.value)
        })
        console.log('Response:', response.data.result)
        learningTexts.value = response.data.result
    } catch (error) {
        console.log(error)
    }
}

watchEffect(() => {
    if (countWord.value === 0) {
        advancedTexts()
    }
})

const nextWord = async () => {
    try {
        countWord.value++
        console.log('Count Word:', countWord.value)
        const response = await axios.post(`http://localhost:3000/gemini`, {
            countWord: countWord.value
        })
        console.log('Response:', response.data.result)
        learningTexts.value = response.data.result
    } catch (error) {
        console.log(error)
    }
}
</script>

<template>
    <main>
        <div class="modal" v-if="modalState">
            <div class="modal-content">
                <h1>Choose your way of learning today!</h1><br>
                <div class="learning-choice">
                    <span @click="textsLearning()">Language acquisition through texts</span>
                    <span @click="imagesLearning()">Language acquisition through images</span>
                </div>
                <button @click="closeModal()">Close</button>
            </div>
        </div>
        <div class="container">
            <div class="card" v-if="textsLearningState">
                <div v-if="learningTexts === ''" class="loading">
                    <Icon icon="line-md:loading-twotone-loop" style="color: black; font-size: 100px;" />
                </div>
                <p>{{ learningTexts }}</p>
                <hr>
                <button class="buttonForTexts" @click="nextWord()" v-if="learningTexts">Next</button>
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
        // height: 80%;
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

        p {
            margin-top: 15px;
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

@media (max-width: 768px) {
  .modal .modal-content {
    height: 80%;
  }
}
</style>