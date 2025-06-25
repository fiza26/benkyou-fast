<script setup>
import { ref, computed, onMounted, watchEffect, watch } from 'vue'
import router from '@/router';
import supabase from '@/supabase';

const localUser = ref(null)

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

const name = ref('')
const username = ref('')
const email = ref('')
const password = ref('')

const loginCardState = ref(true)
const signUpCardState = ref(false)

async function login() {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value
    })
    if (error) {
        console.log('Login Error')
        window.alert('Login error, incorrect email or password')
        email.value = ''
        password.value = ''
    } else {
        setTimeout(() => {
            router.push({ name: 'home' })
        }, 1000)
    }
}

async function signUp() {
    if (!name.value || !username.value || !email.value || !password.value) {
        window.alert('Field can not bet empty')
        return
    }

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
        console.log('SignUp Error')
        window.alert('SignUp error, try again')
        name.value = ''
        username.value = ''
        email.value = ''
        password.value = ''
    } else {
        window.alert('Registration completed, check your email to confirm')
        await addUser()
    }
}

async function addUser() {
    const { error } = await supabase.from('users_data').insert({
        name: name.value,
        email: email.value,
        day_streak: 1,
        username: username.value
    })

    if (error) {
        console.log('Error while adding user:', error)
    }
}

const signUpState = (() => {
    signUpCardState.value = true
    loginCardState.value = false
})

const loginState = (() => {
    loginCardState.value = true
})
</script>

<template>
    <main>
        <div class="container">
            <div class="card-container">
                <div class="login-card" v-if="loginCardState">
                    <label for="">Email</label><br><br>
                    <input type="text" placeholder="Enter your email" v-model="email" required>
                    <label for="">Password</label><br><br>
                    <input type="password" placeholder="Enter your password" v-model="password" required>
                    <button type="submit" @click="login()">Login</button>
                    <p class="signup-text">Don't have an account? <span @click="signUpState()">create one</span></p>
                </div>
                <div class="signup-card" v-else>
                    <label for="">Name</label><br><br>
                    <input type="text" placeholder="Enter your name" v-model="name" required>
                    <label for="">Username</label><br><br>
                    <input type="text" placeholder="Enter your username" v-model="username" required>
                    <label for="">Email</label><br><br>
                    <input type="text" placeholder="Enter your email" v-model="email" required>
                    <label for="">Password</label><br><br>
                    <input type="password" placeholder="Enter your password" v-model="password" required>
                    <button type="submit" @click="signUp()">Login</button>
                    <p class="login-text">Already have an account? <span @click="loginState()">login</span></p>
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

.container {
    margin: 80px;
    display: flex;
    flex-direction: column;
    transition: ease-in-out 0.5s;

    .card-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;

        .login-card {
            font-family: "Poppins", sans-serif;
            background-color: #ecf0f1;
            width: 350px;
            height: 400px;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 10px 10px 46px -19px rgba(0, 0, 0, 0.75);
            margin-top: 30px;
            margin-bottom: 15px;
            transition: ease-in-out 0.5s;
            backdrop-filter: blur(10px);

            label {
                margin-bottom: 10px;
            }

            input {
                font-family: "Poppins", sans-serif;
                width: 100%;
                border-radius: 15px;
                padding: 10px;
                border: none;
                margin-bottom: 25px;
            }

            button {
                font-family: "Poppins", sans-serif;
                width: 100%;
                border: none;
                border-radius: 15px;
                padding: 10px;
                color: white;
                cursor: pointer;
                background: linear-gradient(90deg, #00d2ff 0%, #3a47d5 100%);
            }

            .signup-text {
                margin-top: 50px;
                font-size: 15px;
                text-align: center;

                span {
                    color: white;
                    padding: 3px;
                    cursor: pointer;
                    text-decoration: underline;
                    background: linear-gradient(90deg, #00d2ff 0%, #3a47d5 100%);
                }
            }

        }

        .signup-card {
            font-family: "Poppins", sans-serif;
            background-color: #ecf0f1;
            width: 350px;
            height: 620px;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 10px 10px 46px -19px rgba(0, 0, 0, 0.75);
            margin-top: 30px;
            margin-bottom: 15px;
            transition: ease-in-out 0.5s;
            backdrop-filter: blur(10px);

            label {
                margin-bottom: 10px;
            }

            input {
                font-family: "Poppins", sans-serif;
                width: 100%;
                border-radius: 15px;
                padding: 10px;
                border: none;
                margin-bottom: 25px;
            }

            button {
                font-family: "Poppins", sans-serif;
                width: 100%;
                border: none;
                border-radius: 15px;
                padding: 10px;
                color: white;
                cursor: pointer;
                background: linear-gradient(90deg, #00d2ff 0%, #3a47d5 100%);
            }

            .login-text {
                margin-top: 50px;
                font-size: 15px;
                text-align: center;

                span {
                    color: white;
                    padding: 3px;
                    cursor: pointer;
                    text-decoration: underline;
                    background: linear-gradient(90deg, #00d2ff 0%, #3a47d5 100%);
                }
            }

        }
    }
}

@media screen and (max-width: 768px) {
    .container .card-container .login-card .signup-text {
        font-size: 10px;
    }
}
</style>