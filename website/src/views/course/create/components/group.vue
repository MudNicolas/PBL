<template>
    <div>
        <el-row>
            <el-col :span="16" :offset="4">
                <el-form-item>
                    <div class="info">分组操作可后续进行</div>
                </el-form-item>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="16" :offset="4">
                <div style="text-align: center">
                    <el-transfer
                        style="text-align: left; display: inline-block"
                        v-model="value4"
                        filterable
                        :left-default-checked="[2, 3]"
                        :right-default-checked="[1]"
                        :titles="['Source', 'Target']"
                        :button-texts="['到左边', '到右边']"
                        :format="{
                            noChecked: '${total}',
                            hasChecked: '${checked}/${total}',
                        }"
                        @change="handleChange"
                        :data="data"
                    >
                        <span slot-scope="{ option }"
                            >{{ option.key }} - {{ option.label }}</span
                        >
                        <el-button
                            class="transfer-footer"
                            slot="left-footer"
                            size="small"
                            >操作</el-button
                        >
                        <el-button
                            class="transfer-footer"
                            slot="right-footer"
                            size="small"
                            >操作</el-button
                        >
                    </el-transfer>
                </div>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="16" :offset="4" style="margin-top: 16px">
                <el-form-item>
                    <el-button style="margin-top: 12px" @click="prev"
                        >上一步</el-button
                    >

                    <el-button
                        style="margin-top: 12px"
                        @click="next"
                        type="primary"
                        >下一步</el-button
                    >
                </el-form-item>
            </el-col>
        </el-row>
    </div>
</template>

<script>
export default {
    name: "group",
    methods: {
        next() {
            this.$emit("next");
        },
        prev() {
            this.$emit("prev");
        },
    },
};
</script>

<style>
</style>