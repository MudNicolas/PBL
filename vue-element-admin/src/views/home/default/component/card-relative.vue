<template>
    <el-card :body-style="{ padding: '0px' }" style="visibility: hidden">
        <div class="block image-loading-wrap">
            <el-image :src="course.cover" fit="fill"> </el-image>
        </div>
        <div style="width: 100%">
            <div style="padding: 14px">
                <span style="float: right; margin: 0 8px"
                    ><i class="el-icon-arrow-down"
                /></span>
                <span>{{ course.title }} </span>
                <div class="bottom clearfix">
                    <div class="teacher">
                        <span>
                            {{ course.chiefTeacher.name }}
                        </span>
                        <span
                            v-for="teacher in course.partnerTeacher"
                            :key="course._id + teacher.name"
                        >
                            {{ teacher.name }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </el-card>
</template>

<script>
export default {
    name: "card-relative",
    props: ["course"],
};
</script>

<style>
.image-loading-wrap {
    width: 100%;
    height: 0;
    padding-bottom: 60%;
    display: block;
    background: #f5f7fa;
    display: flex;
    justify-content: center;
    align-items: center;
}
.teacher {
    font-size: 14px;
    color: #999;
    margin-top: 6px;
}
</style>