<script setup>

</script>

<template>
    <main>
        <div class="container">
            <div class="card">
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
            // padding: 10px;
            // background-color: red;


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