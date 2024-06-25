<script setup lang="ts">
import Cookie from 'js-cookie'
Cookie.remove('token')
const router = useRouter()
window.location.href = '/'

</script>