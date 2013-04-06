using System.Collections.Generic;
using Interation.iRepeater.Repository.Entity;
using Interation.iRepeater.Repository.IRepositoryProvider;
using System.Linq;
using System.Data.Linq;

namespace Interation.iRepeater.Repository.RepositoryImplementation
{
    public class ProductRepository : IProductRepository
    {
        public List<Product> GetNewest()
        {
            using (var db = new iRepeaterDbContext())
            {
                return db.Proc_SelectNewestProducts().ToList();
            }
        }

        public List<Product> GetHottest()
        {
            using (var db = new iRepeaterDbContext())
            {
                return db.Proc_SelectHottestProducts().ToList();
            }
        }
    }
}
