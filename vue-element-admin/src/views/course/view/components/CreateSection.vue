<template>
    <div class="container">
        <transition mode="out-in" name="fade-transform">
            <el-row v-if="stage === 1">
                <el-col :span="14" :offset="5">
                    <el-form label-position="right" label-width="80px" :model="section">
                        <el-form-item>
                            <div class="info">标 * 的为必填项</div>
                        </el-form-item>
                        <el-form-item
                            label="节名"
                            prop="name"
                            :rules="{
                                required: true,
                                message: '节名不能为空',
                                trigger: 'blur',
                            }"
                        >
                            <el-input v-model="section.name" />
                        </el-form-item>

                        <el-form-item label="简介">
                            <el-input
                                type="textarea"
                                v-model="section.info"
                                :autosize="{ minRows: 3 }"
                            />
                        </el-form-item>

                        <el-form-item label="可见性">
                            <el-switch v-model="section.visible" />
                        </el-form-item>
                        <el-form-item>
                            <el-button
                                :loading="loading"
                                :disabled="section.name.trim() === ''"
                                type="primary"
                                @click="submit"
                            >
                                确认
                            </el-button>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
            <div class="suc-wrapper" v-else>
                <div class="wrapper-col">
                    <i class="el-icon-success suc-icon suc-wrapper"></i>
                    <div class="suc-wrapper">
                        <div class="suc-word">节创建成功</div>
                    </div>
                    <div class="suc-wrapper">
                        <router-link :to="'/course/section/view/' + newSectionID">
                            <el-button type="primary">进入节</el-button>
                        </router-link>
                        <router-link :to="'/course/view/' + courseID">
                            <el-button style="margin-left: 10px">返回课程</el-button>
                        </router-link>
                        <el-button @click="toCreate" style="margin-left: 10px">继续创建</el-button>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
import { createSection } from "@/api/section"

export default {
    name: "CreateSection",
    created() {
        this.courseID = this.$route.params.id
    },
    data() {
        return {
            section: {
                name: "",
                info: "",
                visible: true,
            },
            loading: false,
            stage: 1,
            courseID: "",
            newSectionID: "",
        }
    },
    methods: {
        submit() {
            this.section.name = this.section.name.trim()
            if (this.section.name) {
                this.loading = true
                createSection({ courseID: this.courseID, section: this.section })
                    .then(res => {
                        this.stage = 2
                        this.newSectionID = res.data.sectionID
                        this.loading = false
                    })
                    .catch(() => {
                        this.loading = false
                    })
            }
        },
        toCreate() {
            this.section = {
                name: "",
                info: "",
                visible: true,
            }
            this.newSectionID = ""
            this.stage = 1
        },
    },
}
</script>

<style lang='scss' scoped>
.container {
    padding: 30px;
}
.info {
    font-size: 13px;
    color: #666;
}
.suc-wrapper {
    display: flex;
    justify-content: center;
    padding-top: 28px;
}
.wrapper-col {
    flex-direction: column;
}
.suc-icon {
    font-size: 14rem;
    color: rgb(17, 169, 131);
}
.suc-word {
    font-size: 1.4rem;
}
</style>
