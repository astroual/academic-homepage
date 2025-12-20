(function () {

    // 全局变量
    window.isProgrammaticScroll = false;
    let scrollTimeout;

    // 优化的滚动处理
    let ticking = false;
    function handleScrollOptimized() {
        if (window.isProgrammaticScroll) return;

        if (!ticking) {
            requestAnimationFrame(function() {
                sessionStorage.setItem('scrollPosition', window.pageYOffset.toString());
                ticking = false;
            });
            ticking = true;
        }
    }

    // DOM加载完成后的处理
    function handleDOMLoaded() {
        // 移除滚动锁定并恢复滚动位置
        const scrollLock = document.getElementById('scroll-lock');
        if (scrollLock) {
            const scrollY = window.__savedScrollY || 0;
            scrollLock.remove();
            // 立即恢复滚动位置
            if (scrollY > 0) {
                window.scrollTo(0, scrollY);
            }
        }

        // 添加统一的滚动监听
        window.addEventListener('scroll', createUnifiedScrollHandler(), { passive: true });

        // 启用平滑滚动
        setTimeout(function() {
            document.documentElement.classList.add('smooth-scroll');
        }, 100);
    }

    // 绑定事件
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', handleDOMLoaded);
    } else {
        handleDOMLoaded();
    }
})();
async function updateLastCommitDate() {
    try {
        const response = await fetch('https://api.github.com/repos/Louaq/academic-homepage/commits?per_page=1');
        const commits = await response.json();

        if (commits && commits.length > 0) {
            const lastCommitDate = new Date(commits[0].commit.committer.date);
            const options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            const formattedDate = lastCommitDate.toLocaleDateString('en-US', options);
            document.getElementById('last-updated').textContent = formattedDate;
        } else {
            const now = new Date();
            const options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            const currentDate = now.toLocaleDateString('en-US', options);
            document.getElementById('last-updated').textContent = currentDate;
        }
    } catch (error) {
        const now = new Date();
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        const currentDate = now.toLocaleDateString('en-US', options);
        document.getElementById('last-updated').textContent = currentDate;
    }
}

function setupSmoothScrolling() {
    const desktopNavLinks = document.querySelectorAll('.desktop-nav a');
    const navTitle = document.querySelector('.nav-title a');

    function scrollToTarget(targetId, smooth = true) {
        // 标记为程序性滚动
        window.isProgrammaticScroll = true;

        if (targetId === '#home') {
            window.scrollTo({
                top: 0,
                behavior: smooth ? 'smooth' : 'auto'
            });
            // 立即保存滚动位置
            sessionStorage.setItem('scrollPosition', '0');
            // 程序性滚动完成后，延迟清除标记（给滚动动画时间）
            setTimeout(function() {
                window.isProgrammaticScroll = false;
            }, smooth ? 300 : 100);
            return;
        }

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const nav = document.querySelector('.top-nav');
            const navHeight = nav ? nav.offsetHeight : 70;
            const targetTop = targetElement.getBoundingClientRect().top + window.pageYOffset;
            const scrollPosition = targetTop - navHeight - 10;

            window.scrollTo({
                top: scrollPosition,
                behavior: smooth ? 'smooth' : 'auto'
            });

            // 立即保存目标滚动位置
            sessionStorage.setItem('scrollPosition', scrollPosition.toString());

            // 程序性滚动完成后，延迟清除标记（给滚动动画时间）
            setTimeout(function() {
                window.isProgrammaticScroll = false;
            }, smooth ? 1000 : 100);
        } else {
            // 如果找不到目标元素，立即清除标记
            window.isProgrammaticScroll = false;
        }
    }

    // 处理导航栏标题链接点击事件
    if (navTitle) {
        navTitle.addEventListener('click', function (e) {
            e.preventDefault();
            scrollToTarget('#home');

            history.pushState(null, null, '#home');

            desktopNavLinks.forEach(link => link.classList.remove('active'));
            const homeLink = document.querySelector('.desktop-nav a[href="#home"]');
            if (homeLink) homeLink.classList.add('active');
        });
    }

    desktopNavLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = this.getAttribute('href');

                scrollToTarget(targetId);

                history.pushState(null, null, targetId);

                desktopNavLinks.forEach(link => link.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
}

// 统一的滚动处理器 - 合并所有滚动功能
function createUnifiedScrollHandler() {
    let scrollTicking = false;

    // 缓存DOM元素
    const sections = document.querySelectorAll('section[id], header[id]');
    const desktopNavLinks = document.querySelectorAll('.desktop-nav a');
    const topNav = document.querySelector('.top-nav');
    const navContainer = document.querySelector('.nav-container');
    const navTitle = document.querySelector('.nav-title a');
    const backToTopButton = document.getElementById('backToTop');

    return function() {
        if (!scrollTicking) {
            requestAnimationFrame(function() {
                const scrollY = window.pageYOffset;

                // 保存滚动位置
                if (!window.isProgrammaticScroll) {
                    sessionStorage.setItem('scrollPosition', scrollY.toString());
                }

                // 导航高亮
                if (topNav && sections.length > 0) {
                    const navHeight = topNav.offsetHeight;
                    let current = '';

                    if (scrollY < 100) {
                        current = '#home';
                    } else {
                        sections.forEach(section => {
                            const sectionTop = section.offsetTop - navHeight - 10;
                            const sectionHeight = section.offsetHeight;
                            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                                current = '#' + section.getAttribute('id');
                            }
                        });
                    }

                    desktopNavLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === current) {
                            link.classList.add('active');
                        }
                    });
                }

                // 导航栏滚动效果
                if (topNav && navContainer && navTitle) {
                    if (scrollY > 50) {
                        topNav.classList.add('scrolled');
                        navContainer.classList.add('scrolled');
                        navTitle.classList.add('scrolled');
                    } else {
                        topNav.classList.remove('scrolled');
                        navContainer.classList.remove('scrolled');
                        navTitle.classList.remove('scrolled');
                    }
                }

                // 回到顶部按钮
                if (backToTopButton) {
                    if (scrollY > 300) {
                        backToTopButton.classList.add('visible');
                    } else {
                        backToTopButton.classList.remove('visible');
                    }
                }

                scrollTicking = false;
            });
            scrollTicking = true;
        }
    };
}

function setupMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileNav = document.getElementById('mobileNav');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    const mobileNavClose = document.getElementById('mobileNavClose');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav a');

    // 检查必要元素是否存在
    if (!mobileMenuToggle || !mobileNav || !mobileNavOverlay) {
        return;
    }

    // 汉堡菜单点击事件
    mobileMenuToggle.addEventListener('click', function() {
        const icon = mobileMenuToggle.querySelector('i');
        mobileMenuToggle.classList.toggle('active');
        mobileNav.classList.toggle('active');
        mobileNavOverlay.classList.toggle('active');

        // 切换图标和页面滚动
        if (mobileMenuToggle.classList.contains('active')) {
            icon.className = 'fas fa-times';
            document.body.classList.add('mobile-menu-open');
        } else {
            icon.className = 'fas fa-bars';
            document.body.classList.remove('mobile-menu-open');
        }
    });

    // 移动端菜单链接点击事件
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // 只处理页内链接
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();

                const targetId = this.getAttribute('href');
                const icon = mobileMenuToggle.querySelector('i');
                
                // 关闭移动菜单
                mobileMenuToggle.classList.remove('active');
                mobileNav.classList.remove('active');
                mobileNavOverlay.classList.remove('active');
                document.body.classList.remove('mobile-menu-open');
                icon.className = 'fas fa-bars';

                // 标记为程序性滚动
                window.isProgrammaticScroll = true;

                // 使用统一的滚动函数
                if (targetId === '#home') {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                    // 立即保存滚动位置
                    sessionStorage.setItem('scrollPosition', '0');
                    // 程序性滚动完成后，延迟清除标记（给滚动动画时间）
                    setTimeout(function() {
                        window.isProgrammaticScroll = false;
                    }, 1000);
                } else {
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        const nav = document.querySelector('.nav-container');
                        const navHeight = nav ? nav.offsetHeight : 60;
                        const targetTop = targetElement.getBoundingClientRect().top + window.pageYOffset;
                        const scrollPosition = targetTop - navHeight - 10;

                        window.scrollTo({
                            top: scrollPosition,
                            behavior: 'smooth'
                        });
                        // 立即保存目标滚动位置
                        sessionStorage.setItem('scrollPosition', scrollPosition.toString());
                        // 程序性滚动完成后，延迟清除标记（给滚动动画时间）
                        setTimeout(function() {
                            window.isProgrammaticScroll = false;
                        }, 1000);
                    } else {
                        // 如果找不到目标元素，立即清除标记
                        window.isProgrammaticScroll = false;
                    }
                }

                // 更新URL hash
                history.pushState(null, null, targetId);

                // 更新活动链接（桌面端）
                const desktopNavLinks = document.querySelectorAll('.desktop-nav a');
                desktopNavLinks.forEach(link => link.classList.remove('active'));
                const correspondingDesktopLink = document.querySelector(`.desktop-nav a[href="${targetId}"]`);
                if (correspondingDesktopLink) {
                    correspondingDesktopLink.classList.add('active');
                }
            }
        });
    });

    // 点击页面其他地方关闭菜单
    document.addEventListener('click', function(e) {
        if (!mobileMenuToggle.contains(e.target) && !mobileNav.contains(e.target)) {
            const icon = mobileMenuToggle.querySelector('i');
            mobileMenuToggle.classList.remove('active');
            mobileNav.classList.remove('active');
            mobileNavOverlay.classList.remove('active');
            document.body.classList.remove('mobile-menu-open');
            icon.className = 'fas fa-bars';
        }
    });

    // 点击遮罩层关闭菜单
    mobileNavOverlay.addEventListener('click', function() {
        const icon = mobileMenuToggle.querySelector('i');
        mobileMenuToggle.classList.remove('active');
        mobileNav.classList.remove('active');
        mobileNavOverlay.classList.remove('active');
        document.body.classList.remove('mobile-menu-open');
        icon.className = 'fas fa-bars';
    });
}

// 禁用包含"Under Review"的条目的链接（标题和 pub-links）
function disableUnderReviewLinks() {
    document.querySelectorAll('.publication-item').forEach(item => {
        const hasUnderReview = item.querySelector('.venue-rank')?.textContent.trim().toLowerCase() === 'under review';
        if (!hasUnderReview) return;
        // 标题链接
        const titleLink = item.querySelector('.pub-content h3 a');
        if (titleLink) {
            titleLink.classList.add('link-disabled');
            titleLink.removeAttribute('href');
            titleLink.removeAttribute('target');
        }
        // pub-links 内的链接
        item.querySelectorAll('.pub-links a').forEach(a => {
            a.classList.add('link-disabled');
            a.removeAttribute('href');
            a.removeAttribute('target');
        });
    });
}

// Publications 初始化 - 显示所有文章和年份标题
function setupPublicationsFilter() {
    const publicationsList = document.querySelector('.publications-list');
    const filterButtons = document.querySelectorAll('.year-filter-btn');

    if (!publicationsList || filterButtons.length === 0) return;

    // 缓存所有元素，避免重复查询DOM
    const yearHeaders = Array.from(publicationsList.querySelectorAll('.year-header'));
    const allItems = Array.from(publicationsList.querySelectorAll('.publication-item'));

    // 筛选函数 - 直接操作style.display，确保立即生效，无延迟
    function filterByYear(year) {
        var i, headerYear, itemYear, header, item;
        
        if (year === 'all') {
            // 显示所有年份标题和文章 - 直接设置style，最快
            for (i = 0; i < yearHeaders.length; i++) {
                header = yearHeaders[i];
                header.style.display = '';
                header.classList.remove('year-hidden');
            }
            for (i = 0; i < allItems.length; i++) {
                item = allItems[i];
                item.style.display = '';
                item.classList.remove('year-hidden');
            }
        } else {
            // 筛选年份标题和文章 - 直接设置style，最快
            for (i = 0; i < yearHeaders.length; i++) {
                header = yearHeaders[i];
                headerYear = header.getAttribute('data-year');
                if (headerYear === year) {
                    header.style.display = '';
                    header.classList.remove('year-hidden');
                } else {
                    header.style.display = 'none';
                    header.classList.add('year-hidden');
                }
            }
            for (i = 0; i < allItems.length; i++) {
                item = allItems[i];
                itemYear = item.getAttribute('data-year');
                if (itemYear === year) {
                    item.style.display = '';
                    item.classList.remove('year-hidden');
                } else {
                    item.style.display = 'none';
                    item.classList.add('year-hidden');
                }
            }
        }
    }

    // 为每个按钮添加点击事件 - 立即执行，无延迟
    filterButtons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const year = this.getAttribute('data-year');

            // 立即更新按钮状态
            filterButtons.forEach(function(btn) {
                btn.classList.remove('active');
            });
            this.classList.add('active');

            // 立即执行筛选，同步操作确保无延迟
            filterByYear(year);
        }, false);
    });

    // 初始化：显示所有文章
    filterByYear('all');
}

// BibTeX 关键字高亮函数
function highlightBibtexKeywords(bibtexText) {
    // 定义需要高亮的关键字
    const keywords = ['title', 'author', 'booktitle', 'pages', 'year', 'organization'];
    
    // 定义BibTeX类型（如 @inproceedings, @article 等）
    const bibtexTypes = ['@inproceedings', '@article', '@book', '@phdthesis', '@mastersthesis', '@techreport', '@misc'];
    
    // 转义HTML特殊字符
    let escapedText = bibtexText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    
    // 处理每一行：关键字和值都用span包裹
    // 按行分割处理，以便更好地处理多行值
    const lines = escapedText.split('\n');
    const processedLines = lines.map((line, index) => {
        // 处理第一行：@inproceedings{key, 格式
        if (index === 0) {
            // 匹配 BibTeX 类型和key
            const firstLineMatch = line.match(/^(@\w+)\s*\{([^,}]+)(,?)$/);
            if (firstLineMatch) {
                const type = firstLineMatch[1];
                const key = firstLineMatch[2];
                const comma = firstLineMatch[3];
                const isBibtexType = bibtexTypes.some(t => t.toLowerCase() === type.toLowerCase());
                const typeClass = isBibtexType ? 'bibtex-type' : '';
                const keyClass = 'bibtex-value';
                
                return '<span class="' + typeClass + '">' + type + '</span> {' + 
                       '<span class="' + keyClass + '">' + key + '</span>' + comma;
            }
            // 如果不匹配，返回原行
            return line;
        }
        
        // 处理最后一行：} 格式
        if (line.trim() === '}') {
            return '<span class="bibtex-value">}</span>';
        }
        
        // 只处理包含 = 的行（即关键字=值的行）
        // 跳过空行以及已经包含 HTML 标签的行
        if (!line.includes('=') || line.trim() === '' || line.includes('<span')) {
            return line;
        }
        
        // 匹配格式：keyword = {value} 或 keyword = value 或 keyword = {value},
        // 匹配行中的关键字和值
        return line.replace(/(\s*)(\w+)\s*=\s*(.+?)(\s*,?\s*)$/, function(match, indent, keyword, value, comma) {
            // 检查是否是关键字列表中的关键字
            const isKeyword = keywords.some(k => k.toLowerCase() === keyword.toLowerCase());
            const keywordClass = isKeyword ? 'bibtex-keyword' : '';
            const valueClass = 'bibtex-value';
            
            // 如果值以花括号开始，需要匹配到对应的结束花括号
            let actualValue = value;
            let remainingComma = comma;
            if (value.trim().startsWith('{')) {
                // 计算花括号的匹配
                let braceCount = 0;
                let endIndex = 0;
                for (let i = 0; i < value.length; i++) {
                    if (value[i] === '{') braceCount++;
                    if (value[i] === '}') {
                        braceCount--;
                        if (braceCount === 0) {
                            endIndex = i + 1;
                            break;
                        }
                    }
                }
                if (endIndex > 0) {
                    actualValue = value.substring(0, endIndex);
                    remainingComma = value.substring(endIndex) + comma;
                }
            }
            
            return indent + 
                   '<span class="' + keywordClass + '">' + keyword + '</span> <span class="bibtex-value">=</span> ' + 
                   '<span class="' + valueClass + '">' + actualValue + '</span>' + remainingComma;
        });
    });
    
    return processedLines.join('\n');
}

// BibTeX 面板功能
function setupBibtexPanel() {
    const bibtexLinks = document.querySelectorAll('.bibtex-link');

    if (bibtexLinks.length === 0) return;

    // 为每个bibtex链接创建对应的面板
    bibtexLinks.forEach(link => {
        // 找到对应的出版物项
        const publicationItem = link.closest('.publication-item');
        if (!publicationItem) return;

        // 检查是否已经存在面板
        let bibtexPanel = publicationItem.querySelector('.bibtex-panel');
        
        // 如果不存在，创建面板
        if (!bibtexPanel) {
            bibtexPanel = document.createElement('div');
            bibtexPanel.className = 'bibtex-panel';
            bibtexPanel.innerHTML = `
                <div class="bibtex-panel-content">
                    <button class="bibtex-copy-btn" title="复制">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="6" y="6" width="8" height="8" rx="1" fill="currentColor" opacity="0.6"/>
                            <rect x="2" y="2" width="8" height="8" rx="1" fill="currentColor"/>
                        </svg>
                    </button>
                    <pre class="bibtex-content"></pre>
                </div>
            `;
            publicationItem.appendChild(bibtexPanel);

            const bibtexContent = bibtexPanel.querySelector('.bibtex-content');
            const bibtexCopyBtn = bibtexPanel.querySelector('.bibtex-copy-btn');
            const bibtexCopyBtnSvg = bibtexCopyBtn.querySelector('svg');

            // 切换图标为对勾
            function showCheckmark() {
                bibtexCopyBtnSvg.innerHTML = `
                    <path d="M13.5 4L6 11.5L2.5 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                `;
                bibtexCopyBtn.setAttribute('title', '已复制!');
            }

            // 恢复复制图标
            function restoreCopyIcon() {
                bibtexCopyBtnSvg.innerHTML = `
                    <rect x="6" y="6" width="8" height="8" rx="1" fill="currentColor" opacity="0.6"/>
                    <rect x="2" y="2" width="8" height="8" rx="1" fill="currentColor"/>
                `;
                bibtexCopyBtn.setAttribute('title', '复制');
            }

            // 复制BibTeX内容
            function copyBibtex() {
                // 获取原始文本（去除HTML标签）
                const text = bibtexContent.textContent || bibtexContent.innerText;
                navigator.clipboard.writeText(text).then(() => {
                    // 显示对勾图标
                    showCheckmark();
                    // 2秒后恢复复制图标
                    setTimeout(() => {
                        restoreCopyIcon();
                    }, 2000);
                }).catch(err => {
                    // 备用方案：使用传统方法
                    const textArea = document.createElement('textarea');
                    textArea.value = text;
                    textArea.style.position = 'fixed';
                    textArea.style.opacity = '0';
                    document.body.appendChild(textArea);
                    textArea.select();
                    try {
                        document.execCommand('copy');
                        // 显示对勾图标
                        showCheckmark();
                        // 2秒后恢复复制图标
                        setTimeout(() => {
                            restoreCopyIcon();
                        }, 2000);
                    } catch (err) {
                    }
                    document.body.removeChild(textArea);
                });
            }

            // 复制按钮点击事件
            bibtexCopyBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                copyBibtex();
            });
        }

        const bibtexContent = bibtexPanel.querySelector('.bibtex-content');

        // 点击bibtex链接切换显示/隐藏
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const bibtexText = this.getAttribute('data-bibtex');
            if (!bibtexText) return;

            // 检查是否已经显示
            const isShowing = bibtexPanel.classList.contains('show');
            
            // 先关闭所有其他面板
            document.querySelectorAll('.bibtex-panel.show').forEach(panel => {
                if (panel !== bibtexPanel) {
                    panel.classList.remove('show');
                }
            });

            if (isShowing) {
                // 如果正在显示，则关闭
                bibtexPanel.classList.remove('show');
            } else {
                // 如果未显示，则显示并高亮关键字
                const highlightedText = highlightBibtexKeywords(bibtexText);
                bibtexContent.innerHTML = highlightedText;
                bibtexPanel.classList.add('show');
                
                // 平滑滚动到面板位置
                setTimeout(() => {
                    bibtexPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 100);
            }
        });
    });

    // ESC键关闭所有面板
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.bibtex-panel.show').forEach(panel => {
                panel.classList.remove('show');
            });
        }
    });
}

// 邮件图标复制功能
function setupEmailCopy() {
    const emailIcon = document.getElementById('emailIcon');
    const emailCopyToast = document.getElementById('emailCopyToast');
    const emailTooltip = emailIcon ? emailIcon.querySelector('.social-icon-tooltip') : null;
    if (!emailIcon || !emailCopyToast) return;

    const emailAddress = 'yangyang@mail.scuec.edu.cn';

    emailIcon.addEventListener('click', function(e) {
        e.preventDefault();
        
        // 复制邮件地址到剪贴板
        navigator.clipboard.writeText(emailAddress).then(() => {
            // 隐藏悬浮提示（如果显示）
            if (emailTooltip) {
                emailTooltip.style.opacity = '0';
                emailTooltip.style.visibility = 'hidden';
            }
            // 显示复制成功的提示消息
            emailCopyToast.classList.add('show');
            
            // 2秒后隐藏提示
            setTimeout(() => {
                emailCopyToast.classList.remove('show');
            }, 2000);
        }).catch(err => {
            // 备用方案：使用传统方法
            const textArea = document.createElement('textarea');
            textArea.value = emailAddress;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                // 隐藏悬浮提示（如果显示）
                if (emailTooltip) {
                    emailTooltip.style.opacity = '0';
                    emailTooltip.style.visibility = 'hidden';
                }
                // 显示复制成功的提示消息
                emailCopyToast.classList.add('show');
                
                // 2秒后隐藏提示
                setTimeout(() => {
                    emailCopyToast.classList.remove('show');
                }, 2000);
            } catch (err) {

            }
            document.body.removeChild(textArea);
        });
    });
}

// 天气组件功能
function setupWeatherWidget() {
    const weatherWidget = document.getElementById('weatherWidget');
    if (!weatherWidget) return;

    // 配置信息
    const config = {
        // 使用 OpenWeatherMap 免费 API（需要注册获取 API Key）
        apiKey: '30acd16e894e76bac5d170e923022fd7', // 替换为你的 API Key
        city: 'Wuhan',
        countryCode: 'CN',
        units: 'metric', // metric = 摄氏度, imperial = 华氏度
        lang: 'en' // 英文
    };

    // 天气图标映射（使用 Font Awesome 图标）
    const weatherIcons = {
        '01d': '☀️', '01n': '🌙',
        '02d': '⛅', '02n': '☁️',
        '03d': '☁️', '03n': '☁️',
        '04d': '☁️', '04n': '☁️',
        '09d': '🌧️', '09n': '🌧️',
        '10d': '🌦️', '10n': '🌧️',
        '11d': '⛈️', '11n': '⛈️',
        '13d': '❄️', '13n': '❄️',
        '50d': '🌫️', '50n': '🌫️'
    };

    // 获取天气数据
    async function fetchWeather() {
        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${config.city},${config.countryCode}&appid=${config.apiKey}&units=${config.units}&lang=${config.lang}`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('天气数据获取失败');
            }
            
            const data = await response.json();
            displayWeather(data);
        } catch (error) {
            displayError();
        }
    }

    // 显示天气信息（简化版：显示城市、温度和天气图标）
    function displayWeather(data) {
        const temp = Math.round(data.main.temp);
        const cityName = data.name;
        const weatherCode = data.weather[0].icon;
        
        // 天气图标映射
        const weatherIconMap = {
            '01d': '☀️', // 晴天
            '01n': '🌙', // 晴夜
            '02d': '🌤️', // 少云（白天）
            '02n': '☁️', // 少云（夜晚）
            '03d': '☁️', // 多云
            '03n': '☁️', // 多云
            '04d': '☁️', // 阴天
            '04n': '☁️', // 阴天
            '09d': '🌧️', // 阵雨
            '09n': '🌧️', // 阵雨
            '10d': '🌦️', // 小雨（白天）
            '10n': '🌧️', // 小雨（夜晚）
            '11d': '⛈️', // 雷暴
            '11n': '⛈️', // 雷暴
            '13d': '❄️', // 雪
            '13n': '❄️', // 雪
            '50d': '🌫️', // 雾
            '50n': '🌫️'  // 雾
        };
        
        const weatherIcon = weatherIconMap[weatherCode] || '🌤️';

        weatherWidget.innerHTML = `
            <div class="weather-content-simple">
                <div class="weather-left">
                    <div class="weather-city-simple">${cityName}</div>
                    <div class="weather-temp-simple">${temp}°C</div>
                </div>
                <div class="weather-icon-simple">${weatherIcon}</div>
            </div>
        `;
    }

    // 显示错误信息
    function displayError() {
        weatherWidget.innerHTML = `
            <div class="weather-error">
                <i class="fas fa-exclamation-triangle"></i>
                <span>天气数据加载失败</span>
            </div>
        `;
    }

    // 初始化：加载天气数据
    fetchWeather();
    
    // 每30分钟更新一次天气
    setInterval(fetchWeather, 30 * 60 * 1000);
}

document.addEventListener('DOMContentLoaded', function () {
    // 设置当前年份
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
    
    updateLastCommitDate();
    setupSmoothScrolling();
    setupMobileMenu();
    disableUnderReviewLinks();
    setupPublicationsFilter();
    setupBibtexPanel(); // 初始化BibTeX面板
    setupEmailCopy(); // 初始化邮件复制功能
    setupWeatherWidget(); // 初始化天气组件
    
    // 处理浏览器后退/前进按钮
    window.addEventListener('popstate', function() {
        // 标记为程序性滚动
        window.isProgrammaticScroll = true;

        if (window.location.hash) {
            const targetElement = document.querySelector(window.location.hash);
            if (targetElement) {
                const nav = document.querySelector('.top-nav');
                const navHeight = nav ? nav.offsetHeight : 70;
                const targetTop = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const scrollPosition = targetTop - navHeight - 10;

                window.scrollTo({
                    top: scrollPosition,
                    behavior: 'smooth'
                });
                // 立即保存目标滚动位置
                sessionStorage.setItem('scrollPosition', scrollPosition.toString());
                // 程序性滚动完成后，延迟清除标记（给滚动动画时间）
                setTimeout(function() {
                    window.isProgrammaticScroll = false;
                }, 300);
            } else {
                window.isProgrammaticScroll = false;
            }
        } else {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            // 立即保存滚动位置
            sessionStorage.setItem('scrollPosition', '0');
            // 程序性滚动完成后，延迟清除标记（给滚动动画时间）
            setTimeout(function() {
                window.isProgrammaticScroll = false;
            }, 300);
        }
    });
});
// 回到顶部按钮功能
document.addEventListener('DOMContentLoaded', function () {
    const backToTopButton = document.getElementById('backToTop');

    if (!backToTopButton) return;

    // 滚动监听已合并到统一处理器中

    // 点击事件 - 优化：减少延迟，使用更快的滚动
    backToTopButton.addEventListener('click', function () {
        // 标记为程序性滚动
        window.isProgrammaticScroll = true;

        // 使用 instant 滚动，立即跳转，避免卡顿
        window.scrollTo({
            top: 0,
            behavior: 'auto'
        });

        // 立即保存滚动位置
        sessionStorage.setItem('scrollPosition', '0');

        // 快速清除标记
        setTimeout(function() {
            window.isProgrammaticScroll = false;
        }, 200);
    });
});





