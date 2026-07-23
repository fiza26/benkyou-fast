<script setup>
import { ref, onMounted } from 'vue'
import supabase from '@/supabase';
import { Icon } from '@iconify/vue'

const usersData = ref([])

async function getUsersData() {
    const { data, error } = await supabase
        .from('users_data')
        .select('name, words_learned, points')
        .order('points', { ascending: false })

    if (error) {
        console.error('Error fetching users data:', error.message)
    } else {
        usersData.value = data
    }
}

onMounted(getUsersData)

// Helper for medal icons
const getRankIcon = (index) => {
    if (index === 0) return 'fluent-emoji:1st-place-medal'
    if (index === 1) return 'fluent-emoji:2nd-place-medal'
    if (index === 2) return 'fluent-emoji:3rd-place-medal'
    return null
}
</script>

<template>
    <main>
        <div class="container">
            <div class="header-container">
                <div class="title-box">
                    <Icon icon="fluent-color:star-16" width="60" height="60" />
                    <h1>Leaderboard</h1>
                    <p>Top Japanese Language Learners</p>
                </div>
            </div>

            <div class="leaderboard-wrapper">
                <div v-for="(user, index) in usersData" :key="index" class="user-row"
                    :class="{ 'top-three': index < 3 }">
                    <div class="rank-section">
                        <Icon v-if="index < 3" :icon="getRankIcon(index)" width="40" height="40" />
                        <span v-else class="rank-number">#{{ index + 1 }}</span>
                    </div>

                    <div class="user-info">
                        <h3>{{ user.name }}</h3>
                        <p>{{ user.words_learned }} words learned</p>
                    </div>

                    <div class="points-section">
                        <span>{{ user.points }}</span>
                        <p>PTS</p>
                    </div>
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

.container {
    margin: 40px auto;
    max-width: 800px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    font-family: "Poppins", sans-serif;

    .header-container {
        background: linear-gradient(90deg, #00d2ff 0%, #3a47d5 100%);
        border-radius: 15px;
        padding: 40px;
        color: white;
        text-align: center;
        box-shadow: 10px 10px 46px -19px rgba(0, 0, 0, 0.75);
        margin-bottom: 30px;
        animation: moveUp 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;

        .title-box {
            h1 {
                font-size: 2.5rem;
                margin: 10px 0;
            }

            p {
                opacity: 0.8;
                font-weight: 300;
            }
        }
    }

    .leaderboard-wrapper {
        display: flex;
        flex-direction: column;
        gap: 15px;

        .user-row {
            display: flex;
            align-items: center;
            background-color: #ecf0f1;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 10px 10px 30px -20px rgba(0, 0, 0, 0.5);
            transition: transform 0.3s ease;

            &:hover {
                transform: scale(1.02);
            }

            &.top-three {
                border-left: 8px solid #3a47d5;
                background-color: white;
            }

            .rank-section {
                width: 60px;
                display: flex;
                justify-content: center;

                .rank-number {
                    font-size: 1.2rem;
                    font-weight: bold;
                    color: #7f8c8d;
                }
            }

            .user-info {
                flex: 1;
                margin-left: 15px;

                h3 {
                    color: #2c3e50;
                    font-size: 1.1rem;
                }

                p {
                    color: #7f8c8d;
                    font-size: 0.9rem;
                }
            }

            .points-section {
                text-align: right;
                background: linear-gradient(90deg, #00d2ff 0%, #3a47d5 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;

                span {
                    font-size: 1.5rem;
                    font-weight: 800;
                    display: block;
                    line-height: 1;
                }

                p {
                    font-size: 0.7rem;
                    font-weight: bold;
                    color: #3a47d5; // Fallback
                    -webkit-text-fill-color: initial;
                }
            }
        }
    }
}

@keyframes moveUp {
    0% {
        transform: translateY(20px);
        opacity: 0;
    }

    100% {
        transform: translateY(0);
        opacity: 1;
    }
}

@media (max-width: 768px) {
    .container {
        margin: 20px;

        .header-container {
            padding: 20px;

            h1 {
                font-size: 1.8rem;
            }
        }
    }
}
</style>