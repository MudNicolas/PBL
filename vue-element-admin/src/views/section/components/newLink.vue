<template>
    <div>
        <el-form>
            <el-form-item
                v-for="(link, index) in links"
                :label="'链接' + index"
                :key="link.key"
                :prop="'link.' + index + '.value'"
                :rules="{
                    required: true,
                    message: '链接不能为空',
                    trigger: 'blur',
                }"
            >
                <el-row>
                    <el-col style="width: calc((100% - 90px) / 2); margin-right: 10px">
                        <el-input v-model="link.name" placeholder="名称"></el-input>
                    </el-col>
                    <el-col style="width: calc((100% - 90px) / 2); margin-right: 10px">
                        <el-input v-model="link.value" placeholder="链接"></el-input>
                    </el-col>
                    <el-col :span="1">
                        <el-button @click.prevent="removeLink(link)">删除</el-button>
                    </el-col>
                </el-row>
            </el-form-item>
            <el-form-item>
                <el-button @click="addLink" icon="el-icon-plus">新增链接</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
export default {
    name: "NewLink",
    data() {
        return {
            links: [
                {
                    value: "",
                    name: "",
                },
            ],
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
    },
}
</script>

<style>
</style>
