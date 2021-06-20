<template>
    <div>
        <el-row>
            <el-col :span="16" :offset="4">
                <el-form-item>
                    <div class="info">合作教师数据可后续添加</div>
                </el-form-item>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="16" :offset="4">
                <el-form-item label="合作教师">
                    <el-select
                        v-model="course.partnerID"
                        multiple
                        filterable
                        remote
                        reserve-keyword
                        :popper-append-to-body="popperAppendToBody"
                        placeholder="请输入姓名进行搜索"
                        :remote-method="fetchTeacher"
                        :loading="searchLoading"
                    >
                        <el-option
                            v-for="item in options"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        >
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-col>
        </el-row>

        <el-row>
            <el-col :span="16" :offset="4" style="margin-top: 16px">
                <el-form-item>
                    <el-button style="margin-top: 12px" @click="prev"
                        >上一步</el-button
                    >

                    <el-button
                        type="primary"
                        @click="onSubmit"
                        :loading="upLoading"
                        >立即创建</el-button
                    >
                </el-form-item>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { searchTeacher } from "@/api/course";

export default {
    name: "partner",
    props: ["course", "options"],
    data() {
        return {
            searchLoading: false,
            localOptions: [],
            upLoading: false,
            popperAppendToBody: true,
        };
    },
    methods: {
        fetchTeacher(query) {
            if (query !== "") {
                this.searchLoading = true;
                searchTeacher({ name: query })
                    .then((res) => {
                        const { data } = res;
                        this.localOptions = data.map((item) => {
                            return {
                                value: item._id,
                                label: item.username + " " + item.name,
                            };
                        });
                        this.$emit("update:options", this.localOptions);
                        this.searchLoading = false;
                    })
                    .catch(() => {
                        this.searchLoading = false;
                    });
            } else {
                this.localOptions = [];
                this.$emit("update:options", []);
            }
        },
        prev() {
            this.$emit("prev");
        },
        onSubmit() {
            if (this.course.name.trim() != "") {
                this.$confirm("确认信息无误以创建课程？", "提示", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning",
                }).then(() => {
                    this.upLoading = true;

                    this.$emit("onSubmit");
                });
            } else {
                this.$message.error("必填项为空");
            }
        },
        onErr() {
            this.upLoading = false;
        },
    },
};
</script>

<style>
</style>