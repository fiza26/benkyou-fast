<script setup>
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import supabase from '@/supabase'

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
</script>

<template>
    <main>
        <div class="container">
            <div class="card-container">
                <div class="card" v-for="word in learnedWords" :key="word.id" v-if="learnedWords.length > 0">
                    <h1>{{ word.word }}</h1>
                    <p>{{ word.meaning }}</p>
                    <p>{{ word.furigana }}</p>
                    <p>{{ word.romaji }}</p>
                    <p>Level : {{ word.level }}</p>
                </div>
                <p v-else>No data</p>
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

.container {
    margin: 80px;
    display: flex;
    flex-direction: column;
    transition: ease-in-out 0.5s;

    .card-container {
        display: flex;
        flex-wrap: wrap;

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

            &:hover {
                transform: scale(1.020);
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
    }
}
</style>