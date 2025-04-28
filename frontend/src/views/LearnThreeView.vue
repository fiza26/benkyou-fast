<script setup>
import { ref } from 'vue'

const modalState = ref(true)

const textsLearningState = ref(false)
const imagesLearningState = ref(false)



</script>

<template>
    <main>
        <div class="modal" v-if="modalState">
            <div class="modal-content">
                <h1>Choose your way of learning today!</h1><br>
                <div class="learning-choice">
                    <span>Language acquisition through texts</span>
                    <span>Language acquisition through images</span>
                </div>
                <button>Close</button>
            </div>
        </div>
        <div class="container">
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
        transform: scale(0);
        animation: moveUp 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
        background: linear-gradient(90deg, #00d2ff 0%, #3a47d5 100%);
        color: white;
        padding: 20px;
        border-radius: 15px;
        width: 70%;
        height: 100%;
        margin-top: 50%;
        margin-right: 7px;
        margin-left: 7px;
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

        p {
            margin-top: 15px;
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
</style>