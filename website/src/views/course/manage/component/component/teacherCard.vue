<template>
    <el-card class="box-card" shadow="hover">
        <div class="profile-wrapper" v-if="t.avatar">
            <div class="info-wrapper">
                <div class="avatar-wrapper">
                    <img :src="path + t.avatar" class="user-avatar" />
                </div>
                <div class="name-message">
                    {{ t.name }}
                    <emit-message-button v-if="uid !== t._id" :uid="t._id" />
                </div>
            </div>
        </div>
    </el-card>
</template>

<script>
import EmitMessageButton from "@/components/EmitMessageButton";
export default {
    name: "TeacherCard",
    components: { EmitMessageButton },
    props: {
        t: {
            type: Object,
            default: {},
        },
        uid: {
            type: String,
            default: "",
        },
    },
    data() {
        return {
            path:
                process.env.VUE_APP_PUBLIC_PATH +
                process.env.VUE_APP_AVATAR_PATH,
        };
    },
};
</script>

<style lang='scss' scoped>
.profile-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
}

.info-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;

    .name-message {
        display: flex;
        flex-direction: column;
        margin-left: 12px;
        font-size: 16px;
    }

    .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
            width: 60px;
            height: 60px;
            border-radius: 30px;
        }
    }
}
</style>
