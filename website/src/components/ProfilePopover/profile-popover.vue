<template>
    <div v-loading="loading" style="min-height: 60px; padding: 8px">
        <div class="profile-wrapper" v-if="profile.avatar">
            <div class="info-wrapper">
                <div class="avatar-wrapper">
                    <img :src="path + profile.avatar" class="user-avatar" />
                </div>
                <div class="name-message">
                    {{ profile.name }}
                    <emit-message-button :uid="profile._id" />
                </div>
            </div>
            <div class="user-bio">
                <div class="user-education user-bio-section">
                    <div class="user-bio-section-header">
                        <svg-icon icon-class="education" />
                        <span>Introduction</span>
                    </div>
                    <div class="user-bio-section-body">
                        <div class="text-muted">
                            {{ profile.introduction ? profile.introduction : "暂无简介" }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { getProfilePopoverInfo } from "@/api/user"
import EmitMessageButton from "@/components/EmitMessageButton"
export default {
    name: "ProfilePopover",
    props: ["uid", "showUpPopoverKey"],
    components: { EmitMessageButton },
    data() {
        return {
            loading: true,
            profile: {
                name: "",
                introduction: "",
                avatar: "",
            },
            path: process.env.VUE_APP_PUBLIC_PATH + process.env.VUE_APP_AVATAR_PATH,
            created: false,
        }
    },
    watch: {
        showUpPopoverKey(val) {
            if (val === this.uid && !this.created) {
                this.getProfilePopoverInfo()
                this.created = true
            }
        },
    },

    methods: {
        getProfilePopoverInfo() {
            getProfilePopoverInfo({ uid: this.uid }).then(res => {
                this.loading = false
                this.profile = res.data
            })
        },
        handleMessage(uid) {
            console.log(uid)
        },
    },
}
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
.user-bio {
    margin-top: 20px;
    color: #606266;

    span {
        padding-left: 4px;
    }

    .user-bio-section {
        font-size: 14px;
        padding: 15px 0;

        .user-bio-section-header {
            border-bottom: 1px solid #dfe6ec;
            padding-bottom: 10px;
            margin-bottom: 10px;
            font-weight: bold;
        }
    }
}
</style>
