<template>
    <div>
        <div v-if="value !== 0">
            <span>{{ value }} ₽</span>
            <br />
            <span style="font-size: 0.85em; color: #666;">
                ≈ {{ (value * 0.079).toFixed(2) }} ￥
            </span>
        </div>
        <div v-else>0</div>
    </div>
</template>
  
<script>
export default {
    props: {
        value: {
            type: Number,
            required: true
        }
    }
}
</script>
  