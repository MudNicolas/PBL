<template>
  <div class="container">
    <user-manager role="teacher" :show-set-admin="checkPermission(['root'])" />
  </div>
</template>

<script>
import checkPermission from '@/utils/permission' // 权限判断函数

import UserManager from '../components/UserManager.vue'
export default {
    name: 'TeacherManager',
    components: { UserManager },
    methods: { checkPermission }
}
</script>

<style lang="scss" scoped>
.container {
    padding: 40px;
    min-height: 80vh;
}
</style>
