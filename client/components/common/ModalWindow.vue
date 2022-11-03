
<template>
    <div>
        <button id="show-modal" @click="showModal = true">Make a suggestion</button>
        <div v-if="showModal">
            <div class="modal-mask">
                <div class="modal-wrapper">
                <div class="modal-container">
        
                    <div class="modal-header">
                    <slot name="header">
                        {{title}}
                    </slot>
                    <button class="modal-default-button" @click="showModal = false">
                        &times;
                    </button>
                    </div>
        
                    <div class="modal-body">
                    <slot name="body">
                        <component v-bind:is="body"></component>
                    </slot>
                    </div>
        
                    <div class="modal-footer">
                    <slot name="footer">
                        <component v-bind:is="footer"></component>
                    </slot>
                    </div>
                </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ModalWindow',
    props: {
        body: {
            type: [String, Object],
            default: 'div',
        },
        title: {
            type: String,
            default: ''
        },
        footer: {
            type: [String, Object],
            default: 'div',
        },
    },
    data(){
        return {
            showModal: false,
        }
    }
}
</script>

<style scoped>
.modal-mask {
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: table;
    transition: opacity 0.3s ease;
}

.modal-wrapper {
    display: table-cell;
    vertical-align: middle;
}

.modal-container {
    width: 50%;
    margin: 0px auto;
    padding: 20px 30px;
    background-color: #fff;
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
    transition: all 0.3s ease;
    font-family: Helvetica, Arial, sans-serif;
}

.modal-header h3 {
    margin-top: 0;
    color: #42b983;
}

.modal-body {
    margin: 20px 0;
}

.modal-default-button {
    float: right;
    background: none;
	color: inherit;
	border: none;
	padding: 0;
	font: inherit;
	cursor: pointer;
	outline: inherit;
}

/*
* The following styles are auto-applied to elements with
* transition="modal" when their visibility is toggled
* by Vue.js.
*
* You can easily play with the modal transition by editing
* these styles.
*/

.modal-enter {
    opacity: 0;
}

.modal-leave-active {
    opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
    -webkit-transform: scale(1.1);
    transform: scale(1.1);
}
</style>