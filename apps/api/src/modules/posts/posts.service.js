var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { Injectable, NotFoundException } from '@nestjs/common';
import { PostStatus } from './entities/post.entity';
let PostsService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var PostsService = _classThis = class {
        constructor(postsRepository) {
            this.postsRepository = postsRepository;
        }
        /**
         * Create a new blog post
         */
        async create(createPostDto, author) {
            const post = this.postsRepository.create(Object.assign(Object.assign({}, createPostDto), { author }));
            return this.postsRepository.save(post);
        }
        /**
         * Get all posts with pagination
         */
        async findAll(page = 1, limit = 10, includePremium = false) {
            const query = this.postsRepository.createQueryBuilder('post')
                .leftJoinAndSelect('post.author', 'author')
                .where('post.status = :status', { status: PostStatus.PUBLISHED });
            if (!includePremium) {
                query.andWhere('post.isPremium = :isPremium', { isPremium: false });
            }
            const [posts, total] = await query
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            return {
                posts,
                meta: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        }
        /**
         * Get a single post by slug
         */
        async findBySlug(slug) {
            const post = await this.postsRepository.findOne({
                where: { slug },
                relations: ['author'],
            });
            if (!post) {
                throw new NotFoundException('Post not found');
            }
            return post;
        }
        /**
         * Increment view count
         */
        async incrementViewCount(id) {
            await this.postsRepository.increment({ id }, 'viewCount', 1);
        }
        /**
         * Update post status
         */
        async updateStatus(id, status) {
            const post = await this.postsRepository.findOne({ where: { id } });
            if (!post) {
                throw new NotFoundException('Post not found');
            }
            post.status = status;
            return this.postsRepository.save(post);
        }
        /**
         * Find a post by id
         */
        async findById(id) {
            const post = await this.postsRepository.findOne({
                where: { id },
                relations: ['author'],
            });
            if (!post) {
                throw new NotFoundException('Post not found');
            }
            return post;
        }
        async update(id, updatePostDto) {
            const post = await this.findById(id);
            Object.assign(post, updatePostDto);
            return this.postsRepository.save(post);
        }
        async remove(id) {
            const post = await this.findById(id);
            await this.postsRepository.remove(post);
        }
    };
    __setFunctionName(_classThis, "PostsService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PostsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PostsService = _classThis;
})();
export { PostsService };
