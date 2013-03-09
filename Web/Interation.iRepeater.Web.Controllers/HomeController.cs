using System.Collections.Generic;
using System.Web.Mvc;
using Interation.iRepeater.Web.ViewModel;

namespace Interation.iRepeater.Web.Controllers
{
    public class HomeController : Controller
    {
        public JsonResult Index()
        {
            var homeViewModel = new HomeViewModel
            {
                Recommend = new List<ProductViewModel>(),
                Latest = new List<ProductViewModel>(),
                Popular = new List<ProductViewModel>()
            };

            return Json(homeViewModel, JsonRequestBehavior.AllowGet);
        }
    }
}
