<script setup>
import { ref } from 'vue'
import supabase from '@/supabase';

const usersData = ref([])

async function getUsersData() {
    const { data, error } = await supabase.from('users_data').select('name, words_learned, points').order('points', { ascending: false })

    if (error) {
        console.error('Error fetching users data:', error.message)
    }

    usersData.value = data
    console.log('Users Data:', usersData.value)
}
getUsersData()

</script>

<template>
    <main>
        <div class="container">
            <div class="leaderboard">
                <h1>⭐ Leaderboard</h1>
                <br>
                <table>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Words Learned</th>
                        <th>Points</th>
                    </tr>
                    <tr v-for="(user, index) in usersData" :key="user.id">
                        <th>{{ index + 1 }}</th>
                        <td>{{ user.name }}</td>
                        <td>{{ user.words_learned }}</td>
                        <td>{{ user.points }}</td>
                    </tr>
                </table>
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

.container {
    margin: 80px;
    display: flex;
    flex-direction: column;
    transition: ease-in-out 0.5s;

    .leaderboard {
        background-color: #ecf0f1;
        padding: 20px;
        border-radius: 15px;
        box-shadow: 10px 10px 46px -19px rgba(0, 0, 0, 0.75);

        table {
            border-collapse: collapse;
            width: 100%;

            td,
            th {
                border: 1px solid #dddddd;
                text-align: left;
                padding: 8px;
            }
        }
    }
}

@media (max-width: 768px) {
    .container .leaderboard {
        overflow: scroll;
    }
}
</style>