import {useState, useRef, useEffect} from 'react';
import {
  Button,
  Input,
  Label,
  ErrorMessage,
  TextArea,
  Select,
  ListBox,
  TagGroup,
  Tag,
  Description
} from "@heroui/react";
import { useNavigate } from 'react-router-dom';
import {getPopularTag, publishArticle} from "../../api/api.tsx";
import type {ArticlePublishResponse, PopularTag} from "../../api/Response.tsx";
import type {Key} from "@heroui/react";

export interface PublishProps {
  title: string;
  content: string;
  visibility: string;
  imageUrls: string[];
  tags: PopularTag[];
}

interface VisibilityOption {
  key: string;
  label: string;
  icon: string;
}

const visibilityOptions: VisibilityOption[] = [
  { key: 'all', label: '公开', icon: '🌍' },
  { key: 'currentSchool', label: '校内可见', icon: '👥' }
];

export function Publish() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [publish, setPublish] = useState<PublishProps>({
    title: '',
    content: '',
    visibility: 'all',
    imageUrls: [],
    tags: []
  });
  
  const [titlePass, setTitlePass] = useState<boolean>(true);
  const [contentPass, setContentPass] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');
  const [popularTags, setPopularTags] = useState<PopularTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Iterable<Key>>(new Set([]));

  function ChangeTitle(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (value.length < 1 || value.length > 100) {
      setTitlePass(false);
    } else {
      setTitlePass(true);
    }
    setPublish({...publish, title: value});
  }

  function ChangeContent(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    if (value.length < 1 || value.length > 5000) {
      setContentPass(false);
    } else {
      setContentPass(true);
    }
    setPublish({...publish, content: value});
  }

  function SelectChange(e: any){
    console.log('选中的值:', e);
    // e 是一个数组，包含选中的项
    if (e && e.length > 0) {
      const selectedKey = e[0]; // 获取选中的 key
      console.log('选中的 key:', selectedKey);
      
      // 找到对应的选项数据
      const selectedOption = visibilityOptions.find(opt => opt.key === selectedKey);
      console.log('选中的完整数据:', selectedOption);
      
      // 更新状态
      setPublish({...publish, visibility: selectedKey});
    }
  }

  // 处理图片选择
  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }

    // 验证文件大小（限制 5MB）
    if (file.size > 5 * 1024 * 1024) {
      setError('图片大小不能超过 5MB');
      return;
    }

    uploadImage(file);
  }

  // 上传图片到服务器
  async function uploadImage(file: File) {
    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      // TODO: 调用图片上传接口
      console.log('上传图片:', file.name);
      
      // 模拟上传成功，实际应该调用 API
      // const response = await uploadImageApi(formData);
      // const imageUrl = response.data.url;
      
      // 模拟返回 URL
      const mockImageUrl = `https://example.com/uploads/${Date.now()}_${file.name}`;
      
      // 更新状态
      const newImageUrls = [...publish.imageUrls, mockImageUrl];
      setPublish({...publish, imageUrls: newImageUrls});
      setPreviewImages([...previewImages, URL.createObjectURL(file)]);
      
      setSuccess('图片上传成功');
      setTimeout(() => setSuccess(''), 2000);

    } catch (err) {
      console.error('上传错误:', err);
      const errorMessage = err instanceof Error ? err.message : '图片上传失败';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  }

  // 删除图片
  function removeImage(index: number) {
    const newImageUrls = publish.imageUrls.filter((_, i) => i !== index);
    const newPreviewImages = previewImages.filter((_, i) => i !== index);
    setPublish({...publish, imageUrls: newImageUrls});
    setPreviewImages(newPreviewImages);
  }

  // 触发文件选择
  function triggerFileInput() {
    fileInputRef.current?.click();
  }

  // 处理标签输入
  function handleTagInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTagInput(e.target.value);
  }

  // 添加标签
  function addTag(e?: React.KeyboardEvent<HTMLInputElement>) {
    if (e && e.key !== 'Enter') return;
    
    const tagName = tagInput.trim();
    
    // 验证标签
    if (!tagName) return;
    if (tagName.length > 20) {
      setError('标签长度不能超过 20 个字符');
      return;
    }
    if (publish.tags.some(tag => tag.tagName === tagName)) {
      setError('标签已存在');
      return;
    }
    if (publish.tags.length >= 10) {
      setError('最多只能添加 10 个标签');
      return;
    }

    // 创建新标签对象（自定义标签没有 id 和 hot）
    const newTag: PopularTag = {
      tagName: tagName,
      id: Date.now(), // 使用时间戳作为临时 ID
      hot: 0
    };

    // 添加标签
    setPublish({...publish, tags: [...publish.tags, newTag]});
    setTagInput('');
    setError('');
  }

  // 删除标签
  function removeTag(index: number) {
    const removedTag = publish.tags[index];
    const newTags = publish.tags.filter((_, i) => i !== index);
    setPublish({...publish, tags: newTags});
    
    // 如果删除的标签在热门标签中，同步更新热门标签的选中状态
    const isPopularTag = popularTags.some(tag => tag.id === removedTag.id);
    if (isPopularTag) {
      const newSelectedTags = new Set(Array.from(selectedTags).filter(key => key !== removedTag.tagName));
      setSelectedTags(newSelectedTags);
    }
  }

  // 处理热门标签选择变化
  function handleTagSelectionChange(keys: Iterable<Key>) {
    setSelectedTags(keys);
    
    // 将选中的热门标签转换为 PopularTag 对象数组
    const selectedKeysArray = Array.from(keys);
    const selectedTagObjects = selectedKeysArray.map(key => {
      const tag = popularTags.find(t => t.tagName === key);
      return tag;
    }).filter((tag): tag is PopularTag => tag !== undefined);
    
    // 限制最多10个标签
    if (selectedTagObjects.length <= 10) {
      setPublish({...publish, tags: selectedTagObjects});
    } else {
      setError('最多只能添加 10 个标签');
      // 保持之前的选择
      setSelectedTags(new Set(publish.tags.map(tag => tag.tagName)));
    }
  }

  async function submit() {
    // 验证必填字段
    if (publish.title === '') {
      setTitlePass(false);
      return;
    }

    if (publish.content === '') {
      setContentPass(false);
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // 调用发布接口
      console.log('发布信息:', publish);
      
      const publishArticleResponse: ArticlePublishResponse = await publishArticle({
        ...publish,
        tags: publish.tags.map(tag => ({
          id: tag.id,
          tagName: tag.tagName
        })),
        imageUrls: publish.imageUrls.map(url => ({url}))
      });

      if (publishArticleResponse.code === 200){
        setSuccess('发布成功！即将跳转到列表页...');

        navigate('/campusList');
      }else {
        console.error('发布错误:', publishArticleResponse.message);
        setError(publishArticleResponse.message);
      }
    } catch (err) {
      console.error('发布错误:', err);
      const errorMessage = err instanceof Error ? err.message : '发布失败，请稍后重试';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const fetchPopularTags = async () => {
      try {
        const tags = await getPopularTag();
        console.log('热门标签:', tags.data);
        setPopularTags(tags.data);
      } catch (err) {
        console.error('获取热门标签错误:', err);
      }
    };
    fetchPopularTags();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100">
      {/* 背景动画圆圈 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* 玻璃态卡片 */}
      <div className="relative z-10 w-full max-w-3xl mx-4 my-8">
        <div className="backdrop-blur-xl bg-white/40 rounded-3xl shadow-2xl p-8 border border-white/30">
          {/* Logo 和标题 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-sky-500/20 rounded-full mb-4 backdrop-blur-sm">
              <svg className="w-12 h-12 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">发布信息</h1>
            <p className="text-gray-600">分享你的校园动态</p>
          </div>

          <div className="flex flex-col gap-6">
            {/* 标题输入 */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="input-title" className="text-gray-700 font-medium">标题</Label>
              <Input 
                id="input-title" 
                placeholder="请输入标题（1-100 字符）" 
                type="text"
                className="bg-white/60 border-gray-300 text-gray-800 placeholder-gray-500 px-4 py-3 rounded-lg focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
                value={publish?.title || ''}
                onChange={ChangeTitle}
              />
              {!titlePass && <ErrorMessage className="text-red-500">标题长度为 1-100 字符</ErrorMessage>}
            </div>

            {/* 内容输入 */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="input-content" className="text-gray-700 font-medium">内容</Label>
              <TextArea
                id="input-content" 
                placeholder="分享你的想法..." 
                className="bg-white/60 border-gray-300 text-gray-800 placeholder-gray-500 px-4 py-3 rounded-lg focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200 min-h-[200px]"
                value={publish?.content || ''}
                onChange={ChangeContent}
              />
              {!contentPass && <ErrorMessage className="text-red-500">内容长度为 1-5000 字符</ErrorMessage>}
            </div>

            {/* 可见范围选择 */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="select-visibility" className="text-gray-700 font-medium">可见范围</Label>
              <Select 
                className="w-full bg-white/60 border-gray-300 text-gray-800" 
                placeholder="请选择可见范围" 
                selectionMode="single"
                selectedKeys={publish.visibility ? [publish.visibility] : []}
                onSelectionChange={SelectChange}
              >
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {visibilityOptions.map((option) => (
                      <ListBox.Item key={option.key} textValue={option.label}>
                        <div className="flex items-center gap-2">
                          <span>{option.icon}</span>
                          <span>{option.label}</span>
                        </div>
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>

            {/* 标签输入 */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="input-tags" className="text-gray-700 font-medium">标签</Label>
              <div className="space-y-3">
                {/* 标签输入框 */}
                <Input 
                  id="input-tags" 
                  placeholder="输入标签后按回车添加（最多 10 个）" 
                  type="text"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={addTag}
                  className="bg-white/60 border-gray-300 text-gray-800 placeholder-gray-500 px-4 py-3 rounded-lg focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
                />
                
                {/* 标签列表 */}
                {publish.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {publish.tags.map((tag, index) => (
                      <div 
                        key={tag.id || index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-sky-500/20 text-sky-700 rounded-full text-sm border border-sky-500/30 hover:bg-sky-500/30 transition-colors duration-200"
                      >
                        <span>#{tag.tagName}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="hover:text-red-500 transition-colors duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* 标签数量提示 */}
                <p className="text-xs text-gray-500">
                  已添加 {publish.tags.length}/10 个标签
                </p>
              </div>
            </div>

            {/* 热门标签 */}
            {popularTags.length > 0 && (
              <div className="flex flex-col gap-3">
                <TagGroup
                  selectedKeys={selectedTags}
                  selectionMode="multiple"
                  onSelectionChange={handleTagSelectionChange}
                >
                  <Label className="text-gray-700 font-medium">热门标签</Label>
                  <TagGroup.List className="flex flex-wrap gap-2">
                    {popularTags.map((tag) => (
                      <Tag 
                        key={tag.tagName} 
                        id={tag.tagName}
                        className="cursor-pointer"
                      >
                        {tag.tagName}
                      </Tag>
                    ))}
                  </TagGroup.List>
                  <Description className="text-xs text-gray-500 mt-1">
                    已选择: {Array.from(selectedTags).length > 0 ? Array.from(selectedTags).join(", ") : "无"}
                  </Description>
                </TagGroup>
              </div>
            )}


            {/* 图片上传 */}
            <div className="flex flex-col gap-2">
              <Label className="text-gray-700 font-medium">图片上传</Label>
              
              {/* 隐藏的文件输入 */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />

              {/* 上传按钮和预览 */}
              <div className="space-y-3">
                {/* 上传按钮 */}
                <Button
                  fullWidth
                  variant="bordered"
                  className={`border-2 border-dashed border-gray-300 hover:border-sky-500/50 text-gray-500 hover:text-sky-600 py-6 transition-all duration-200 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={triggerFileInput}
                  isLoading={isUploading}
                  startContent={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  }
                >
                  {isUploading ? '上传中...' : '点击或拖拽上传图片（最大 5MB）'}
                </Button>

                {/* 图片预览 */}
                {previewImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {previewImages.map((img, index) => (
                      <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-300">
                        <img 
                          src={img} 
                          alt={`预览${index + 1}`} 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 backdrop-blur-sm">
                <ErrorMessage className="text-red-600 text-sm">{error}</ErrorMessage>
              </div>
            )}

            {/* 成功提示 */}
            {success && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 backdrop-blur-sm">
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            )}

            {/* 发布按钮 */}
            {(titlePass && contentPass) ? (
              <Button
                fullWidth
                variant="primary"
                className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 border-0"
                isLoading={isLoading}
                onClick={submit}
                startContent={isLoading ? null : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              >
                {isLoading ? '发布中...' : '发布'}
              </Button>
            ) : (
              <Button
                isDisabled
                fullWidth
                variant="primary"
                className="w-full bg-gray-300/50 text-gray-500 font-semibold py-3 px-4 rounded-lg cursor-not-allowed border-0"
              >
                发布
              </Button>
            )}

            {/* 取消按钮 */}
            <Button
              fullWidth
              variant="light"
              className="w-full bg-white/60 hover:bg-white/80 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-all duration-200 border border-gray-300"
              onClick={() => navigate('/campusList')}
            >
              取消
            </Button>
          </div>
        </div>

        {/* 版权信息 */}
        <p className="text-center text-gray-500 text-xs mt-6">
          © 2025 智慧校园管理系统。All rights reserved.
        </p>
      </div>
    </div>
  );
}
