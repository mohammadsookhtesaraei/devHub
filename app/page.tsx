// next and react
import Link from "next/link";
import { Suspense } from "react";

// database
import { db } from "@/db";
import { posts, tags, users } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

// components from shadcn
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// normal components
import FeedContainer from "@/features/feed/components/FeedContainer";

// icons
import { Hash, TrendingUp, Users } from "lucide-react";

// type
type HomeProps = {
  searchParams: Promise<{ tag?: string }>;
};


const Home = async ({ searchParams }: HomeProps) => {
  const { tag } = await searchParams;
  const currentUser = await getCurrentUser();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-8">
        {/* left-sidebar */}
        <aside className="hidden lg:block space-y-6">
          {!currentUser && <WelcomeCard />}
          <Suspense>
            <PopularTags />
          </Suspense>
        </aside>
        {/* main-feed */}
           <main className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Feed</h1>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="font-medium">
                Latest
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                Top
              </Button>
            </div>
          </div>

          <FeedContainer tag={tag} />
        </main>

        {/* right-sidebar */}
        <aside className="hidden lg:block space-y-6">
          <Suspense fallback={<SidebarSkeleton />}>
          <TrendingPosts/>
          </Suspense>
          <Suspense fallback={<SidebarSkeleton />}>
          <TopAuthors/>
          </Suspense>
        </aside>
      </div>
    </div>
  );
};
export default Home;

// welocomeCard component
function WelcomeCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Welcome to DevHub! 👋</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <p className="mb-4">
          DevHub is a community of developers sharing knowledge, ideas, and
          experiences.
        </p>
        <div className="space-y-2">
          <Link href="/register">
            <Button className="w-full">Create Account</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="w-full">
              Sign In
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Popular component
async function PopularTags() {
  const popularTags = await db
    .select({
      name: tags.name,
      slug: tags.slug,
      color: tags.color,
      postCount: tags.postCount,
    })
    .from(tags)
    .orderBy(desc(tags.postCount))
    .limit(10);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Hash className="w-4 h-4" />
          PopularTags
        </CardTitle>
      </CardHeader>
      <CardContent>
        {popularTags.length > 0 ? (
          <div>
            {popularTags.map((tag) => (
              <Link key={tag.slug} href={`/?tag=${tag.slug}`}>
                <Badge
                  variant="secondary"
                  className="hover:bg-secondary/80 cursor-pointer bg-"
                >
                  #{tag.name}
                  <span className="ml-1 text-xs text-muted-foreground">
                    {tag.postCount}
                  </span>
                </Badge>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No tags yet</p>
        )}
      </CardContent>
    </Card>
  );
}

// TrendingPosts component

async function TrendingPosts() {
  const trendingPosts = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      likeCount: posts.likeCount,
      commentCount: posts.commentCount,
    })
    .from(posts)
    .where(eq(posts.status, "published"))
    .orderBy(desc(posts.likeCount))
    .limit(5);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Trending Posts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {trendingPosts.length > 0 ? (
          trendingPosts.map((post, idx) => (
            <Link
              key={post.id}
              href={`/post/${post.slug}`}
              className="block group"
            >
              <div className="flex items-start gap-3">
                <span className="text-lg font-bold text-muted-foreground/50">
                  {idx + 1}
                </span>
                <div>
                  <p className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ❤️ {post.likeCount} · 💬 {post.commentCount}
                  </p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No posts yet</p>
        )}
      </CardContent>
    </Card>
  );
}


// TopAuthors components
async function TopAuthors() {
  const topAuthors = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      avatar: users.avatar,
      postCount: sql<number>`count(${posts.id})::int`.as("post_count"),
    })
    .from(users)
    .leftJoin(posts, eq(posts.authorId, users.id))
    .groupBy(users.id)
    .orderBy(desc(sql`count(${posts.id})`))
    .limit(5);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-4 w-4" />
          Top Authors
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {topAuthors.length > 0 ? (
          topAuthors.map((author) => (
            <Link
              key={author.id}
              href={`/profile/${author.username}`}
              className="flex items-center gap-3 group"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                {author.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                  {author.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {author.postCount} posts
                </p>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No authors yet</p>
        )}
      </CardContent>
    </Card>
  );
}

// sidebarSkeletonComponent
function SidebarSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
    </Card>
  );
}
