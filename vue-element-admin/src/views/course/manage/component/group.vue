<template>
    <div>
        <el-table
            :data="group"
            :span-method="objectSpanMethod"
            border
            style="width: 100%; margin-top: 20px"
            v-loading="loading"
        >
            <el-table-column type="index" width="50" label="序号">
            </el-table-column>
            <el-table-column
                prop="name"
                label="组名"
                width="240"
                align="center"
            >
            </el-table-column>
            <el-table-column prop="member" label="成员"> </el-table-column>
            <el-table-column label="操作" align="center" width="360">
                <template slot-scope="scope">
                    <emit-message-button :uid="scope.row._id" />
                    <el-button type="primary" @click="edit(scope.row._id)"
                        ><i class="el-icon-edit" />&nbsp;编辑</el-button
                    >
                    <el-button
                        type="danger"
                        :disabled="deleteSubmitting"
                        @click="deleteCommentTemplate(scope.row._id)"
                        ><i class="el-icon-delete" />&nbsp;删除</el-button
                    >
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
import EmitMessageButton from "@/components/EmitMessageButton";
export default {
    name: "ManageCourseGroup",
    props: ["courseId"],
    components: { EmitMessageButton },
    data() {
        return {
            group: [],
            loading: false,
            deleteSubmitting: false,
        };
    },
    methods: {
        objectSpanMethod() {},
    },
};
</script>

<style>
</style>
