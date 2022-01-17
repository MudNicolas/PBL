<template>
  <div class="container">
    <user-manager ref="manager" role="admin">
      <template v-slot:removeAdmin>
        <el-button type="danger" @click="removeAdminRole">移除管理员</el-button>
      </template>
    </user-manager>
  </div>
</template>

<script>
import UserManager from '../components/UserManager.vue'
import { removeAdminRole } from '@/api/admin'
export default {
    name: 'AdmintManager',
    components: { UserManager },
    methods: {
        removeAdminRole() {
            this.$confirm('确定移除此用户的管理员权限？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                beforeClose: (action, instance, done) => {
                    if (action === 'confirm') {
                        const _id = this.$refs.manager.userInfo.user._id
                        instance.confirmButtonLoading = true
                        removeAdminRole({ _id })
                            .then(() => {
                                this.$message.success('移除成功')
                                instance.confirmButtonLoading = false
                                this.$refs.manager.getUser()
                                this.$refs.manager.infoVisible = false
                                done()
                            })
                            .catch(() => {
                                instance.confirmButtonLoading = false
                                done()
                            })
                    } else {
                        done()
                    }
                }
            }).catch(err => {
                console.log(err)
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.container {
    padding: 40px;
    min-height: 80vh;
}
</style>
