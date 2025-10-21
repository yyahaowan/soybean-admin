<script setup lang="ts">
import { ref } from 'vue';
import { useClipboard } from '@vueuse/core';
import type { FormRules } from 'naive-ui';
import { fetchMaycurTokenClientCredentials } from '@/service/api';

interface FormModel {
  client_id: string;
  client_secret: string;
  grant_type: 'client_credentials';
  scope?: string;
  endpoint: string;
}

const formRef = ref();
const formModel = ref<FormModel>({
  client_id: '',
  client_secret: '',
  grant_type: 'client_credentials',
  scope: '',
  endpoint: '/c/openapi/oauth2/token'
});

const rules: FormRules = {
  client_id: { required: true, message: '请输入 Client ID / App Key', trigger: ['input', 'blur'] },
  client_secret: { required: true, message: '请输入 Client Secret / App Secret', trigger: ['input', 'blur'] }
};

const loading = ref(false);
const result = ref<any>(null);

async function handleGetToken() {
  await (formRef.value as any)?.validate?.();
  loading.value = true;
  result.value = null;
  try {
    const { client_id, client_secret, grant_type, scope, endpoint } = formModel.value;
    const data = await fetchMaycurTokenClientCredentials({ client_id, client_secret, grant_type, scope }, endpoint);
    result.value = data;
    window.$message?.success('请求成功');
  } catch (error: any) {
    window.$message?.error(error?.message || '请求失败');
  } finally {
    loading.value = false;
  }
}

const { copy } = useClipboard();

function handleCopy() {
  if (!result.value) return;
  const text = JSON.stringify(result.value, null, 2);
  copy(text);
  window.$message?.success('已复制');
}
</script>

<template>
  <NSpace vertical :size="16">
    <NAlert type="info" title="说明">
      <div class="flex-col gap-2">
        <div>本页面用于调试/获取 Maycur 接入的 Access Token。请参考以下官方文档：</div>
        <ul class="list-disc pl-5">
          <li>
            <a
              href="https://openapi-ng.maycur.com/develop-guide/how-to-call-apis.html"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary"
            >
              How to call APIs
            </a>
          </li>
          <li>
            <a
              href="https://openapi-ng.maycur.com/develop-guide/api-login.html"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary"
            >
              API 登录（获取 Token）
            </a>
          </li>
        </ul>
        <div>
          开发环境已通过 Vite 代理将请求转发到
          <code>https://openapi-ng.maycur.com</code>
          （前缀
          <code>/proxy-maycur</code>
          ）。生产环境如遇 CORS 限制，请在服务器侧配置代理。
        </div>
      </div>
    </NAlert>

    <NCard :bordered="false" class="card-wrapper">
      <NForm ref="formRef" :model="formModel" :rules="rules" label-width="160" label-placement="left">
        <NGrid x-gap="16" :y-gap="8" cols="1 s:1 m:2">
          <NGi>
            <NFormItem label="Client ID / App Key" path="client_id">
              <NInput v-model:value="formModel.client_id" placeholder="请输入 Maycur 应用的 Client ID / App Key" />
            </NFormItem>
          </NGi>
          <NGi>
            <NFormItem label="Client Secret / App Secret" path="client_secret">
              <NInput
                v-model:value="formModel.client_secret"
                type="password"
                show-password-on="click"
                placeholder="请输入 Maycur 应用的 Client Secret / App Secret"
              />
            </NFormItem>
          </NGi>
          <NGi>
            <NFormItem label="Grant Type">
              <NSelect
                v-model:value="formModel.grant_type"
                :options="[{ label: 'client_credentials', value: 'client_credentials' }]"
              />
            </NFormItem>
          </NGi>
          <NGi>
            <NFormItem label="Scope（可选）">
              <NInput v-model:value="formModel.scope" placeholder="如需指定 scope，请填写，否则留空" />
            </NFormItem>
          </NGi>
          <NGi>
            <NFormItem label="Token 接口路径">
              <NInput v-model:value="formModel.endpoint" placeholder="/c/openapi/oauth2/token" />
            </NFormItem>
          </NGi>
        </NGrid>

        <NSpace>
          <NButton type="primary" :loading="loading" @click="handleGetToken">获取 Token</NButton>
          <NButton :disabled="!result" @click="handleCopy">复制结果</NButton>
        </NSpace>
      </NForm>
    </NCard>

    <NCard :bordered="false" class="card-wrapper">
      <template #header>返回结果</template>
      <div v-if="result">
        <NCode :code="JSON.stringify(result, null, 2)" language="json" word-wrap />
      </div>
      <div v-else class="text-gray-500">暂无结果</div>
    </NCard>
  </NSpace>
</template>

<style scoped></style>
