using System.Web.Mvc;
using Interation.iRepeater.Service.Contract;
using Interation.iRepeater.Service.IServiceProvider;
using Interation.iRepeater.Web.ViewModel;

namespace Interation.iRepeater.Web.Controllers
{
    public class AppController : Controller
    {
        IProductService _productService;
        ITopicService _topicService;

        public AppController(IProductService productService, ITopicService topicService)
        {
            _productService = productService;
            _topicService = topicService;
        }

        public JsonResult Get(string version, string args)
        {
            args = args == null ? string.Empty : args.ToLower();

            switch (args)
            {
                case "genius":
                    return Genius();
                case "charts":
                    return Charts();
                case "categories":
                    return Categories();
                case "purchased":
                    return Purchased();
                case "Updates":
                    return Updates();
                default:
                    return Featured();
            }
        }

        public JsonResult Search(string keywords)
        {   
            return Json(new { }, JsonRequestBehavior.AllowGet);
        }

        private JsonResult Featured()
        {
            var topicContracts = _topicService.GetAdvised();
            var newestProducts = _productService.GetNewest();
            var hottestProducts = _productService.GetHottest();

            var viewModel = new FeaturedViewModel
            {
                Topics = topicContracts == null ? null : topicContracts.ConvertAll(refer => refer.ToViewModel()),
                Newest = new ProductGroupViewModel { Title = "New & Noteworthy", Products = newestProducts == null ? null : newestProducts.ConvertAll(refer => refer.ToViewModel()) },
                Hottest = new ProductGroupViewModel { Title = "What's Hot", Products = hottestProducts == null ? null : hottestProducts.ConvertAll(refer => refer.ToViewModel()) }
            };

            return Json(viewModel, JsonRequestBehavior.AllowGet);
        }

        private JsonResult Genius()
        {
            return Json(new { }, JsonRequestBehavior.AllowGet);
        }

        private JsonResult Charts()
        {
            return Json(new { }, JsonRequestBehavior.AllowGet);
        }

        private JsonResult Categories()
        {
            return Json(new { }, JsonRequestBehavior.AllowGet);
        }

        private JsonResult Purchased()
        {
            return Json(new { }, JsonRequestBehavior.AllowGet);
        }

        private JsonResult Updates()
        {
            return Json(new { }, JsonRequestBehavior.AllowGet);
        }

        private JsonResult Search()
        {
            return Json(new { }, JsonRequestBehavior.AllowGet);
        }
    }
}
