<template>
    <div>
        <div style="margin-bottom: 28px">链接必填，名称选填，未填名称默认将链接作为名称</div>
        <el-form label-position="right" label-width="80px" :model="{ links }" ref="links">
            <el-form-item
                v-for="(link, index) in links"
                :label="'链接' + index"
                :key="link.key"
                :prop="'links.' + index + '.value'"
                :rules="{
                    required: true,
                    message: '链接不能为空',
                    trigger: 'blur',
                }"
            >
                <el-input
                    v-model="link.value"
                    placeholder="链接"
                    style="width: calc((100%) / 2); margin-right: 10px"
                >
                    <template slot="prepend">Http://</template>
                </el-input>
                <el-input
                    v-model="link.name"
                    placeholder="名称"
                    style="width: calc((100% - 300px) / 2); margin-right: 10px"
                ></el-input>

                <el-button v-if="links.length > 1" @click.prevent="removeLink(link)" type="danger">
                    删除
                </el-button>
            </el-form-item>
            <el-form-item>
                <div style="display: flex">
                    <el-button @click="addLink" icon="el-icon-plus">新增链接</el-button>
                    <el-button type="primary" :loading="newLinkSubmitting" @click="submitNewLink">
                        提交
                    </el-button>
                    <el-popconfirm
                        title="确定将输入的信息重置吗？"
                        style="margin-left: auto; margin-right: 140px"
                        @confirm="resetNewLink"
                    >
                        <el-button slot="reference" type="danger">重置</el-button>
                    </el-popconfirm>
                </div>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
import { submitNewLinks } from "@/api/section"

export default {
    name: "NewLink",
    props: ["sectionId"],
    data() {
        return {
            links: [
                {
                    value: "",
                    name: "",
                },
            ],
            newLinkSubmitting: false,
            sectionID: this.sectionId,
        }
    },
    methods: {
        removeLink(item) {
            var index = this.links.indexOf(item)
            if (index !== -1) {
                this.links.splice(index, 1)
            }
        },
        addLink() {
            this.links.push({
                value: "",
                key: Date.now(),
                name: "",
            })
        },
        submitNewLink() {
            this.formValidate("links")
                .then(() => {
                    this.newLinkSubmitting = true
                    let links = this.links.map(e => {
                        return { name: e.name, url: e.value }
                    })
                    submitNewLinks({ sectionID: this.sectionID, links: links })
                        .then(() => {
                            this.$emit("success")
                            this.resetNewLink()
                            this.newLinkSubmitting = false
                            this.$message.success("添加链接成功")
                        })
                        .catch(() => {
                            this.newLinkSubmitting = false
                        })
                })
                .catch(() => {
                    this.$message({
                        message: "请将信息填写完整",
                        type: "warning",
                    })
                })
        },
        resetNewLink() {
            this.links = [
                {
                    value: "",
                    name: "",
                },
            ]
        },
        formValidate(formName) {
            return new Promise((resolve, reject) => {
                this[formName].forEach(e => {
                    e.value = e.value.trim()
                    e.name = e.name.trim()
                    if (!e.name) {
                        e.name = e.value
                    }
                })
                this.$refs[formName].validate(valid => {
                    if (!valid) {
                        reject()
                        return
                    }
                    resolve()
                    return
                })
            })
        },
    },
}
</script>

<style>
</style>
