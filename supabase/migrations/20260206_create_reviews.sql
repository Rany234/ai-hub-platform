-- 创建评价表
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  job_id UUID REFERENCES public.jobs(id) NOT NULL,
  reviewer_id UUID REFERENCES public.profiles(id) NOT NULL, -- 评价者
  reviewee_id UUID REFERENCES public.profiles(id) NOT NULL, -- 被评价者
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  UNIQUE(job_id, reviewer_id) -- 每个任务只能评一次
);
