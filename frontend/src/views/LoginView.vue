<script setup>
import { ref, onMounted, watchEffect } from 'vue'
import router from '@/router';
import supabase from '@/supabase';
import { Icon } from '@iconify/vue'

const localUser = ref(null)

// Toast/Status Modal State
const toastState = ref(false)
const toastMessage = ref('')
const toastType = ref('success') // 'success' or 'error'

const showToast = (msg, type = 'success') => {
    toastMessage.value = msg
    toastType.value = type
    toastState.value = true
}

const closeToast = () => {
    toastState.value = false
}

// Check if user is already logged in
async function isLoggedIn() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
        localUser.value = session
    }
}

onMounted(isLoggedIn)

watchEffect(() => {
    if (localUser.value) {
        router.push({ name: 'home' })
    }
})

// Form Fields
const name = ref('')
const username = ref('')
const email = ref('')
const password = ref('')

const loginCardState = ref(true)

// Authentication Logic
async function login() {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value
    })
    if (error) {
        showToast('Login error, incorrect email or password', 'error')
        email.value = ''
        password.value = ''
    } else {
        showToast('Login successful! Welcome back.')
        setTimeout(() => {
            router.push({ name: 'home' })
        }, 1500)
    }
}

async function checkIfUsernameExist() {
    const { data, error } = await supabase
        .from('users_data')
        .select('username')
        .eq('username', username.value.trim())
        .maybeSingle()

    if (error) {
        showToast('Database connection error', 'error')
        return false
    }

    if (data) {
        showToast('Username already exists, try another', 'error')
        return false
    }

    return true
}

async function signUp() {
    if (!name.value || !username.value || !email.value || !password.value) {
        showToast('Fields cannot be empty', 'error')
        return
    }

    const usernameAvailable = await checkIfUsernameExist()
    if (!usernameAvailable) return

    const { data, error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
            data: {
                name: name.value,
                username: username.value
            }
        }
    })

    if (error) {
        showToast(`SignUp error: ${error.message}`, 'error')
    } else {
        await addUser()
        showToast('Registration completed! Check your email.')
        name.value = username.value = email.value = password.value = ''
        loginCardState.value = true
    }
}

async function addUser() {
    const { error } = await supabase.from('users_data').insert({
        name: name.value,
        email: email.value,
        day_streak: 1,
        username: username.value.trim()
    })
    if (error) console.error('Error adding user profile:', error)
}
</script>

<template>
    <main>
        <div class="modal" v-if="toastState">
            <div class="modal-content" :class="{ 'error-bg': toastType === 'error' }">
                <Icon v-if="toastType === 'success'" icon="fluent-emoji:check-mark-button" width="80" height="80" />
                <Icon v-else icon="fluent-emoji:cross-mark" width="80" height="80" />
                <h1>{{ toastType === 'success' ? 'Success!' : 'Oops!' }}</h1>
                <p>{{ toastMessage }}</p>
                <button @click="closeToast()">Okay</button>
            </div>
        </div>

        <div class="container">
            <div class="card-container">
                <div class="auth-card" v-if="loginCardState">
                    <div class="header-section">
                        <h1>Login</h1>
                        <p>Welcome back to Benkyou Fast</p>
                    </div>

                    <div class="form-body">
                        <label>Email</label>
                        <input type="email" placeholder="Enter your email" v-model="email" @keyup.enter="login">

                        <label>Password</label>
                        <input type="password" placeholder="Enter your password" v-model="password"
                            @keyup.enter="login">

                        <button @click="login()">Login</button>
                        <p class="switch-text">Don't have an account? <span @click="loginCardState = false">Create
                                one</span></p>
                    </div>
                </div>

                <div class="auth-card" v-else>
                    <div class="header-section">
                        <h1>Sign Up</h1>
                        <p>Join the community today</p>
                    </div>

                    <div class="form-body">
                        <label>Name</label>
                        <input type="text" placeholder="Enter your name" v-model="name">

                        <label>Username</label>
                        <input type="text" placeholder="Enter your username" v-model="username">

                        <label>Email</label>
                        <input type="email" placeholder="Enter your email" v-model="email">

                        <label>Password</label>
                        <input type="password" placeholder="Enter your password" v-model="password">

                        <button @click="signUp()">Sign Up</button>
                        <p class="switch-text">Already have an account? <span
                                @click="loginCardState = true">Login</span></p>
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
    margin-top: 50px;
}

// Reuse your Modal Style
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 99;
    display: flex;
    justify-content: center;

    .modal-content {
        animation: moveUp 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
        background: linear-gradient(90deg, #00d2ff 0%, #3a47d5 100%);
        color: white;
        padding: 30px;
        border-top-left-radius: 25px;
        border-top-right-radius: 25px;
        width: 100%;
        max-width: 500px;
        height: 50%;
        position: fixed;
        bottom: 0;
        text-align: center;
        box-shadow: 0px -10px 46px -19px rgba(0, 0, 0, 0.75);

        &.error-bg {
            background: linear-gradient(90deg, #ff4b2b 0%, #ff416c 100%);
        }

        h1 {
            font-family: "Poppins", sans-serif;
            margin-bottom: 10px;
        }

        p {
            font-family: "Poppins", sans-serif;
            opacity: 0.9;
        }

        button {
            font-family: "Poppins", sans-serif;
            margin-top: 20px;
            border: none;
            padding: 10px;
            border-radius: 15px;
            width: 40%;
            background-color: white;
            color: #3a47d5;
            font-weight: bold;
            cursor: pointer;
            transition: 0.3s;

            &:hover {
                transform: scale(1.05);
            }
        }
    }
}

.container {
    margin: 40px auto;
    display: flex;
    justify-content: center;
    font-family: "Poppins", sans-serif;

    .card-container {
        width: 100%;
        max-width: 450px;
        padding: 20px;

        .auth-card {
            background-color: #ecf0f1;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 10px 10px 46px -19px rgba(0, 0, 0, 0.75);
            transition: 0.5s ease-in-out;

            .header-section {
                background: linear-gradient(90deg, #00d2ff 0%, #3a47d5 100%);
                padding: 40px 20px;
                color: white;
                text-align: center;

                h1 {
                    font-size: 2.5rem;
                }

                p {
                    opacity: 0.8;
                    font-size: 0.9rem;
                }
            }

            .form-body {
                padding: 30px;

                label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 600;
                    color: #2c3e50;
                }

                input {
                    width: 100%;
                    font-family: "Poppins", sans-serif;
                    padding: 12px;
                    border-radius: 12px;
                    border: 2px solid transparent;
                    background-color: white;
                    margin-bottom: 20px;
                    transition: 0.3s;

                    &:focus {
                        outline: none;
                        border-color: #00d2ff;
                    }
                }

                button {
                    width: 100%;
                    font-family: "Poppins", sans-serif;
                    padding: 12px;
                    border: none;
                    border-radius: 12px;
                    background: linear-gradient(90deg, #00d2ff 0%, #3a47d5 100%);
                    color: white;
                    font-weight: bold;
                    font-size: 1.1rem;
                    cursor: pointer;
                    transition: 0.3s;
                    margin-top: 10px;

                    &:hover {
                        transform: scale(1.02);
                    }
                }

                .switch-text {
                    text-align: center;
                    margin-top: 25px;
                    font-size: 0.9rem;

                    span {
                        color: #3a47d5;
                        font-weight: bold;
                        cursor: pointer;
                        text-decoration: underline;
                    }
                }
            }
        }
    }
}

@keyframes moveUp {
    0% {
        transform: translateY(100%);
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
    }
}
</style>